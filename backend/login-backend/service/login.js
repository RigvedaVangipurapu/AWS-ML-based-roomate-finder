const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
})
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'users';
const util = require('../utils/util')
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth');

async function login(user) {
    const username = user.username;
    const password = user.password;
    if (!user || !username || !password) {
        return util.buildResponse(401, {
            message: 'Username or password incorrect'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim())
    if (!dynamoUser || !dynamoUser.username) {
        return util.buildResponse(403, {
            message: "User doesn't exist"
        })
    }

    // if (!bcrypt.compareSync(password, dynamoUser.password)) {
    //     return util.buildResponse(403, {
    //         message: 'Password incorrect'
    //     })
    // }
    if (password !== dynamoUser.password) {
        return util.buildResponse(403, {
            message: `Password incorrect`
        })
    }

    // If everything matches, we return user with access token
    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name,
        email: dynamoUser.email,
        age: dynamoUser.age,
        sex: dynamoUser.sex,
        orientation: dynamoUser.orientation,
        diet: dynamoUser.diet,
        drinks: dynamoUser.drinks,
        drugs: dynamoUser.drugs,
        education: dynamoUser.education,
        ethnicity: dynamoUser.ethnicity,
        income: dynamoUser.income,
        location: dynamoUser.location,
        pets: dynamoUser.pets,
        smokes: dynamoUser.smokes,
        speaks: dynamoUser.speaks,
        friendlist: dynamoUser.friendlist
    }

    const token = auth.generateToken(userInfo)

    const params = {
        TableName: userTable
    };

    var scanResults = [];

    var items = undefined;

    // Fetching all users from db and storing it in scanResults array

    // do {
    //     items = await dynamodb.scan(params).promise();
    //     items.Items.forEach((item) => scanResults.push(item));
    //     params.ExclusiveStartKey = items.LastEvaluatedKey;
    // } while (typeof items.LastEvaluatedKey !== "undefined");
    // console.log(scanResults)
    // scanResults = scanResults.slice(0, 10)
    const response = {
        user: userInfo,
        token: token,
        scanResult: scanResults
    }
    console.log(response)
    return util.buildResponse(200, response);
}

async function getUser(username) {
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }
    return await dynamodb.get(params).promise().then(res => {
        return res.Item;
    }, error => {
        console.error('There is an error', error);
    })
}

module.exports.login = login;