const bcrypt = require('bcrypt')
const saltRounds = 10

const encryptPassword = (
    password: String | undefined,
    callback: (err: any, hash: any) => void
) => {
    bcrypt.hash(password, saltRounds, (err: any, hash: string) =>
        callback(err, hash)
    )
}

const comparePassword = (
    password: String | undefined,
    hash: string,
    callback: (err: any, result: boolean) => void
) => {
    bcrypt.compare(password, hash, (err: any, result: boolean) =>
        callback(err, result)
    )
}

const encoder = { encryptPassword, comparePassword }

module.exports = encoder
