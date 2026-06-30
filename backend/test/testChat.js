require("dotenv").config();

const chat = require("../services/chatService");

async function run() {

    const result = await chat(
        "What is Node.js?"
    );

    console.log(result);

}

run();