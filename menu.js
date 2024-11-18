import readline from 'readline';
import readlineSync from 'readline-sync';
import chalk from 'chalk';
import { playerStatus } from './game.js';

// 메뉴 start
export async function menuPage() {
    const menu = ["계속하기", "다시하기", "포기하기", "종료하기", "능력치 페이지"]
    let currentPoint = 0;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    startMenu(menu, currentPoint)

    return new Promise((resolve) => {
        rl.input.on('keypress', (char, key) => {
            if (key.name === 'up') {
                currentPoint = (currentPoint - 1 + menu.length) % menu.length;
                startMenu(menu, currentPoint);
            } else if (key.name === 'down') {
                currentPoint = (currentPoint + 1) % menu.length;
                startMenu(menu,currentPoint)
            } else if (key.name === 'return') {
                rl.close();
                resolve(choiceMenu(currentPoint));
            }
        })
    });
    
}

// 움직임 컨트롤
function startMenu(menu, currentPoint) {
    console.clear();
    menu.forEach((item, index) => {
        if (index === currentPoint) {
            console.log(`> ${item} <`);
        } else {
            console.log(`  ${item}  `);
        }
    })
}

// 선택의 결과
function choiceMenu(currentPoint) {
    switch (currentPoint) {
        case 0:
            return 'continue';
        case 1:
            return 'again';
        case 2:
            return 'giveup';
        case 3:
            return 'quit';
        case 4:
            return 'status';
    }
}

// 결과 실행
export function runChoiceMenu(userChoice, player) {
    switch (userChoice) {
        case 'continue':
            break;
        case 'again':
            return 'again';
        case 'giveup':
            return 'giveup';
        case 'quit':
            return 'quit';
        case 'status':
            while (true){
                console.clear();
                playerStatus(player);
                const getout = readlineSync.question(chalk.greenBright('\n나가시겠습니까? [y/n] '));
                if (getout == 'y') {
                    break;
                }
            }
    }
}