import Sequelize from "sequelize";
import sqlite3 from "sqlite3";
import dotenv from "dotenv"
dotenv.config();
const sequelize = new Sequelize({
    // نوع قاعدة البيناات
    dialect:'sqlite',
    // اسم قاعدة البيانات يجب وضعها بمتغير بيئة لانه:
    // - بالمستقبل قد نغير اسم او مكان قاعدة البيانات
    // - للحماية من المخترقين لان اسم قاعدة البيانات لن تكون بالكود مباشرة
    storage:process.env.DB_FILE_NAME

})

export async function initDB(){
    try{
        // الاتصال بقاعدة البيانات
        await sequelize.sync()
        console.log("Database is running")
    }catch(err){
        console.log("Database is not working correctly")
    }
}
export default sequelize