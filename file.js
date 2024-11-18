import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { printLog } from './game.js';

// 현재시간 함수
function currentTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    return (`${year}-${month}-${day} ${hours}:${minutes}`);
}

// 업적 확인하기 // JSON 파일 불러오기, 승리 stage 기준으로 내림차순
export function ranking() {
    let fileData = fs.readFileSync('data.json', 'utf-8');
    let jsonData = JSON.parse(fileData);
    jsonData.sort((a, b) => b.stage - a.stage);
    console.clear();

    console.log(
        chalk.cyan(
            figlet.textSync('Ranking', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );
    let logs = [];
    printLog(`\nRanking`.padEnd(13), 'green', logs);
    printLog(`Stage`.padEnd(15), 'green', logs);
    printLog(`Date`, 'green', logs);
    console.log(logs[0], logs[1], logs[2])
    console.log("".padEnd(40, '-'));


    for (let i = 0; i < jsonData.length; i++) {
        console.log(`${i + 1}`.padStart(3).padEnd(13), String(jsonData[i].stage).padStart(2).padEnd(10), String(jsonData[i].date));
    }

    let outRanking = readlineSync.question('\n나가시겠습니까? [y/n] ');
    console.log(outRanking);
    if (outRanking !== 'y' && outRanking !== 'Y') {
        ranking()
    }
}

//JSON 파일에 새 객체 생성
export function makeData(stage) {
    let fileData = fs.readFileSync('data.json', 'utf-8');
    let jsonData = JSON.parse(fileData);
    let makeRandId = Math.random().toString(36).substring(2);
    let currDate = currentTime();
    let newData = {
        userId: makeRandId,
        stage: stage,
        date: currDate,
    }

    jsonData.push(newData);

    fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf-8');
}

//JSON 파일에 객체 업데이트
export function updateData(stage) {
    let fileData = fs.readFileSync('data.json', 'utf-8');
    let jsonData = JSON.parse(fileData);
    jsonData[jsonData.length-1].stage = stage;
    jsonData[jsonData.length-1].date = currentTime();

    fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf-8');
}