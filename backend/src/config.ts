// config.ts
import dotenv from 'dotenv'

dotenv.config({})

class Config{
    public DATABASE: string | undefined
    public USERNAME: string | undefined
    public PASSWORD: string | undefined
    public HOST: string | undefined
    public DIALECT: string | undefined
    public JWT_TOKEN: string | undefined
    public NODE_ENV: string | undefined
    public SECRET_ONE_KEY: string | undefined
    public SECRET_TWO_KEY: string| undefined
    public REDIS_HOST: string | undefined

    constructor() {
        this.DATABASE=process.env.DATABASE
        this.USERNAME=process.env.USERNAME
        this.PASSWORD=process.env.PASSWORD
        this.HOST=process.env.HOST
        this.DIALECT=process.env.DIALECT
        this.JWT_TOKEN=process.env.JWT_TOKEN
        this.NODE_ENV=process.env.NODE_ENV
        this.SECRET_ONE_KEY=process.env.SECRET_ONE_KEY as string
        this.SECRET_TWO_KEY=process.env.SECRET_TWO_KEY as string
        this.REDIS_HOST=process.env.REDIS_HOST as string
    }

    public validateConfig():void {
        for(const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is missing`)
            }
        }
    }
}
  
export const config:Config = new Config();
  