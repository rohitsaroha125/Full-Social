import {Application, json, urlencoded, Request, Response, NextFunction} from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import compression from 'compression'
import HTTP_STATUS from 'http-status-codes'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { config } from './config'
import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'
import applicationRoutes from './routes'
import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler'

const SERVER_PORT=5000;

export class FullSocialServer{
    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    public start(): void {
        this.securityMiddleware(this.app)
        this.standardMiddleware(this.app)
        this.routeMiddleware(this.app)
        this.globalErrorHandler(this.app)
        this.startServer(this.app)
    }

    private securityMiddleware(app: Application):void{
        if (config.SECRET_ONE_KEY && config.SECRET_TWO_KEY){
            app.use(cookieSession({
                name: 'session',
                keys: [config.SECRET_ONE_KEY, config.SECRET_TWO_KEY],
                maxAge: 24*7*3600000,
                secure: config.NODE_ENV !== 'development'
            }))
        }
        app.use(hpp())
        app.use(helmet())
        app.use(cors({
            origin: '*',
            credentials:true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }))
    }

    private standardMiddleware(app: Application):void{
        app.use(compression())
        app.use(json({limit: '50mb'}))
        app.use(urlencoded({extended: true, limit:'50mb'}))
    }

    private routeMiddleware(app: Application):void{
        applicationRoutes(app)
    }

    private globalErrorHandler(app: Application):void{
        app.all('*', (req:Request, res:Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message: `${req.originalUrl} not found`
            })
        })

        app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
            console.log(error)
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors())
            }
            next()
        })
    }

    private async startServer(app: Application):Promise<void>{
        try{
            const httpServer: http.Server=new http.Server(app)
            const socketIO: Server=await this.createSocketIO(httpServer)
            this.startHttpServer(httpServer)
            this.socketIOConnections(socketIO)
        }catch(err) {
            console.log(err)
        }
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server>{
        const io:Server=new Server(httpServer, {
            cors:{
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        })

        const pubClient = createClient({url: config.REDIS_HOST})
        const subClient = pubClient.duplicate()
        await Promise.all([pubClient.connect(), subClient.connect()])
        io.adapter(createAdapter(pubClient, subClient))
        return io
    }

    private startHttpServer(httpServer: http.Server):void{
        console.log(`Server started at process ${process.pid}`)
        httpServer.listen(SERVER_PORT,() => {
            console.log(`Server running on port ${SERVER_PORT}`)
        })
    }

    private socketIOConnections(io: Server): void{

    }
}