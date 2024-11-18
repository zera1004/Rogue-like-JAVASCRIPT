import chalk from 'chalk';
import readlineSync from 'readline-sync';
import figlet from 'figlet';
import { menuPage, runChoiceMenu } from './menu.js';
import { damageCalculator, getMonsterMove, resetStatus } from './ingame.js';
import { makeData, updateData } from './file.js';

export let isQuit = false

class Player {
    constructor() {
        this.max_hp = 100;
        this.hp = this.max_hp;
        this.attack_damage = 20;
        this.defensive_power = 5;
        this.heal_amount = 5;
        this.max_double_attack_count = 3;
        this.double_attack_count = this.max_double_attack_count;
        this.max_defense_counter_count = 3;
        this.defense_counter_count = this.max_defense_counter_count;
        this.max_defense_count = 3;
        this.defense_count = this.max_defense_count;
        this.max_heal_count = 3;
        this.heal_count = this.max_heal_count;
        this.up_abilities = 0;
    }
}

class Monster {
    constructor(stage) {
        this.max_hp = 100 + Math.floor(Math.random() * 10 * stage) + (20 * stage);
        this.hp = this.max_hp;
        this.attack_damage = 10 + Math.floor(Math.random() * 1.5 * stage) + (4 * stage);
        this.defensive_power = 5 + Math.floor(Math.random() * 2 * stage) + (3 * stage);
    }
}

// logs.push 함수
export function printLog(message, color, logs) {
    logs.push(chalk[color](message));
}

// 콘솔 디스플레이
function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n============= Current Status ===============`));

    const stageWidth = 13;
    const infoWidth = 15

    console.log(
        chalk.cyanBright(`| Stage: ${String(stage)} `.padEnd(stageWidth)) +
        chalk.blueBright(
            `| Player info`.padEnd(infoWidth),
        ) +
        chalk.redBright(
            `| Monster info`.padEnd(infoWidth) + '|',
        ),
    );
    console.log(
        chalk.cyanBright(`| HP`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.hp)}/${String(player.max_hp)}`.padEnd(infoWidth),
        ) +
        chalk.redBright(
            `| ${String(monster.hp)}/${String(monster.max_hp)}`.padEnd(infoWidth) + '|',
        ),
    );
    console.log(
        chalk.cyanBright(`| Damage`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.attack_damage)}`.padEnd(infoWidth),
        ) +
        chalk.redBright(
            `| ${String(monster.attack_damage)}`.padEnd(infoWidth) + '|',
        ),
    )
    console.log(
        chalk.cyanBright(`| DEF`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.defensive_power)}`.padEnd(infoWidth),
        ) +
        chalk.redBright(
            `| ${String(monster.defensive_power)}`.padEnd(infoWidth) + '|',
        ),
    )
    console.log(
        chalk.cyanBright(`| Heal`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.heal_amount)}`.padEnd(infoWidth),
        ) +
        chalk.redBright(
            `| ${''}`.padEnd(infoWidth) + '|',
        ),
    )
    console.log(chalk.magentaBright(`============================================\n`));
}

// 배틀 함수
export const battle = async (stage, player, monster) => {
    let logs = [];
    resetStatus(player, monster);

    let damage_by_user = damageCalculator(player, monster); // 유저가 입히는 데미지
    let damage_by_monster = damageCalculator(monster, player); // 몬스터가 입히는 데미지

    while (true) {

        if (monster.hp <= 0) {
            return "win";
        } else if (player.hp <= 0) {
            return "lose";
        }
        console.clear();
        displayStatus(stage, player, monster);

        logs.forEach((log) => console.log(log));
        logs = [];

        let [attack_probability, defense_probability, monster_move] = getMonsterMove(); // 몬스터 행동 함수 실행
        console.log(
            chalk.white(
                `\n
========================================================
몬스터의 공격 확률: ${attack_probability}%`.padEnd(20), "| ", `몬스터의 수비 확률: ${defense_probability}%`
            )
        )

        console.log(
            chalk.green(
                `\n1.공격  2.연속공격(${player.double_attack_count}회)  3.방어카운터 공격(${player.defense_counter_count}회)  4.방어(${player.defense_count}회)  5.힐(${player.heal_count}회)
m. 메뉴창`,
            ),
        );

        const choice = readlineSync.question('\n당신의 선택은? ');


        switch (choice) {
            case '1':
                if (monster_move === 'attack') {
                    printLog(`당신은 ${damage_by_monster}데미지를 입고, 몬스터는 ${damage_by_user}데미지를 입었습니다.`, 'yellow', logs);
                    player.hp -= damage_by_monster;
                    monster.hp -= damage_by_user;
                } else if (monster_move === 'defense') {
                    printLog(`몬스터가 공격을 막았습니다.`, 'white', logs);
                }
                break;
            case '2':
                if (player.double_attack_count <= 0){
                    printLog(`스킬을 다 사용 하였습니다.`, 'red', logs);
                    continue;
                }
                if (monster_move === 'attack') {
                    printLog(`당신은 ${damage_by_monster}데미지를 입고, 몬스터는 ${damage_by_user * 2}데미지를 입었습니다.`, 'yellow', logs);
                    player.hp -= damage_by_monster;
                    monster.hp -= damage_by_user * 2;
                    player.double_attack_count--;
                } else if (monster_move === 'defense') {
                    printLog(`몬스터가 공격을 막았습니다.`, 'white', logs);
                    player.double_attack_count--;
                }
                break;
            case '3':
                if (player.defense_counter_count <= 0) {
                    printLog(`스킬을 다 사용 하였습니다.`, 'red', logs);
                    continue;
                }
                if (monster_move === 'attack') {
                    printLog(`당신은 ${damage_by_monster}데미지를 입었습니다.`, 'red', logs);
                    player.hp -= damage_by_monster;
                    player.defense_counter_count--;
                } else if (monster_move === 'defense') {
                    printLog(`몬스터는 ${damage_by_user}데미지를 입었습니다.`, 'blue', logs);
                    monster.hp -= damage_by_user;
                    player.defense_counter_count--;
                }
                break;
            case '4':
                if (player.defense_count <= 0) {
                    printLog(`스킬을 다 사용 하였습니다.`, 'red', logs);
                    continue;
                }
                if (monster_move === 'attack') {
                    printLog(`몬스터의 공격을 막았습니다.`, 'white', logs);
                    player.defense_count--;
                } else if (monster_move === 'defense') {
                    printLog(`아무도 피해를 입지 않았습니다.`, 'white', logs);
                    player.defense_count--;
                }
                break;
            case '5':
                if (player.heal_count <= 0) {
                    printLog(`스킬을 다 사용 하였습니다.`, 'red', logs);
                    continue;
                }
                if (monster_move === 'attack') {
                    if (damage_by_monster > player.heal_amount) {
                        printLog(`당신은 ${damage_by_monster - player.heal_amount}데미지를 입었습니다.`, 'red', logs);
                        player.hp = player.hp - damage_by_monster + player.heal_amount;
                        player.heal_count--;
                    } else if (damage_by_monster < player.heal_amount) {
                        printLog(`당신은 ${player.heal_amount - damage_by_monster} 체력을 회복하였습니다.`, 'green', logs);
                        player.hp = player.hp - damage_by_monster + player.heal_amount;
                        player.heal_count--;
                    } else if (damage_by_monster === player.heal_amount) {
                        printLog(`당신의 체력은 그대로입니다.`, 'white', logs);
                        player.heal_count--;
                    }
                } else if (monster_move === 'defense') {
                    printLog(`당신은 ${player.heal_amount} 체력을 회복하였습니다.`, 'green', logs);
                    player.hp += player.heal_amount;
                    player.heal_count--;
                }
                break;
            case 'm':
            case 'M':
                const userChoice = await menuPage();
                let choiceMenu = runChoiceMenu(userChoice, player);
                if (choiceMenu === 'again' || choiceMenu === 'giveup' || choiceMenu === 'quit') {
                    return choiceMenu;
                }
                break;
            default:
                printLog(`없는 명령입니다. 다시 선택해주세요.`, 'red', logs);
        }
    }
};

// 유저 능력치 창
export function playerStatus(player) {
    console.log(chalk.magentaBright(`\n======== Current Status =======`));

    const stageWidth = 16;
    const infoWidth = 15

    console.log(
        chalk.cyanBright(`| Status `.padEnd(stageWidth)) +
        chalk.blueBright(
            `| Player info`.padEnd(infoWidth) + '|',
        )
    );
    console.log(
        chalk.cyanBright(`| HP`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.max_hp)}`.padEnd(infoWidth) + '|',
        )
    );
    console.log(
        chalk.cyanBright(`| Damage`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.attack_damage)}`.padEnd(infoWidth) + '|',
        )
    )
    console.log(
        chalk.cyanBright(`| DEF`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.defensive_power)}`.padEnd(infoWidth) + '|',
        )
    )
    console.log(
        chalk.cyanBright(`| Heal_amount`.padEnd(stageWidth)) +
        chalk.blueBright(
            `| ${String(player.heal_amount)}`.padEnd(infoWidth) + '|',
        )
    )
    console.log(chalk.magentaBright(`===============================\n`));
}

// 승리후, 유저 보상 창
function clearReword(player) {
    player.up_abilities += 10;
    player.max_hp += 5;
    let logs = []
    let choice2;

    while (true) {
        console.clear();
        console.log(chalk.greenBright("\n**승리하여 보상을 획득합니다**"));
        console.log(chalk.whiteBright("\n**승리 보상으로 체력 +5**"));
        console.log(chalk.whiteBright("**승리 보상으로 능력치 포인트 +10**"));
        playerStatus(player);
        logs.forEach((log) => console.log(log));
        logs = [];
        console.log(`\n올릴 수 있는 능력치: ${player.up_abilities}`);
        console.log(chalk.yellowBright(`\n1.체력  2.공격력  3.방어력  4.힐량  |  5.다음 스테이지로 이동`));

        const choice = readlineSync.question(chalk.greenBright('\n어떤 능력치를 올리시겠습니까? '));
        let num;

        switch (choice) {
            case '1':
                if (player.up_abilities <= 0) {
                    printLog(`능력치 포인트가 없습니다.`, 'red', logs);
                    break;
                }
                choice2 = readlineSync.question(chalk.greenBright('체력을 몇 올리시겠습니까? '));
                if (choice2 === '0') {
                    continue;
                }
                num = Number(choice2);

                if (num <= player.up_abilities && num > 0) {
                    printLog(`체력을 ${choice2} 올렸습니다.`, 'yellow', logs);
                    player.max_hp += num;
                    player.up_abilities -= num;
                    continue;
                }

                if (num < 0) {
                    printLog(`입력할 수 없는 수 입니다.`, 'red', logs);
                } else if (num > player.up_abilities) {
                    printLog(`입력할 수 없는 수 입니다.`, 'red', logs);
                } else {
                    printLog(`입력할 수 없는 수 입니다.`, 'red', logs);
                }
                break;
            case '2':
                if (player.up_abilities <= 0) {
                    printLog(`능력치 포인트가 없습니다.`, 'red', logs);
                    break;
                }
                choice2 = readlineSync.question(chalk.greenBright('공격력을 몇 올리시겠습니까? '));
                if (choice2 === '0') {
                    continue;
                }
                num = Number(choice2);

                if (num <= player.up_abilities &&num > 0) {
                    printLog(`공격력을 ${choice2} 올렸습니다.`, 'yellow', logs);
                    player.attack_damage += num;
                    player.up_abilities -= num;
                    continue;
                } else if (num < 0) {
                    printLog(`입력할 수 없는 수 입니다.`, 'red', logs);
                } else if (num > player.up_abilities) {
                    printLog(`남아 있는 포인트보다 입력값이 큽니다.`, 'red', logs);
                } else {
                    printLog(`없는 명령입니다. 다시 선택해주세요.`, 'red', logs);
                }
                break;
            case '3':
                if (player.up_abilities <= 0) {
                    printLog(`능력치 포인트가 없습니다.`, 'red', logs);
                    break;
                }
                choice2 = readlineSync.question(chalk.greenBright('방어력을 몇 올리시겠습니까? '));
                if (choice2 === '0') {
                    continue;
                }
                num = Number(choice2);

                if (num <= player.up_abilities &&num > 0) {
                    printLog(`방어력을 ${choice2} 올렸습니다.`, 'yellow', logs);
                    player.defensive_power += num;
                    player.up_abilities -= num;
                    continue;
                } else if (num < 0) {
                    printLog(`입력할 수 없는 수 입니다.`, 'red', logs);
                } else if (num > player.up_abilities) {
                    printLog(`남아 있는 포인트보다 입력값이 큽니다.`, 'red', logs);
                } else {
                    printLog(`없는 명령입니다. 다시 선택해주세요.`, 'red', logs);
                }
                break;
            case '4':
                if (player.up_abilities <= 0) {
                    printLog(`능력치 포인트가 없습니다.`, 'red', logs);
                    break;
                }
                choice2 = readlineSync.question(chalk.greenBright('힐량을 몇 올리시겠습니까? '));
                if (choice2 === '0') {
                    continue;
                }
                num = Number(choice2);
                
                if (num <= player.up_abilities && num > 0) {
                    printLog(`힐량을 ${choice2} 올렸습니다.`, 'yellow', logs);
                    player.heal_amount += num;
                    player.up_abilities -= num;
                    continue;
                } else if (num < 0) {
                    printLog(`입력할 수 없는 수 입니다.`, 'red', logs);
                } else if (num > player.up_abilities) {
                    printLog(`남아 있는 포인트보다 입력값이 큽니다.`, 'red', logs);
                } else {
                    printLog(`없는 명령입니다. 다시 선택해주세요.`, 'red', logs);
                }
                break;
            case '5':
                return;
            default:
                printLog(`없는 명령입니다. 다시 선택해주세요.`, 'red', logs);
        }
    }
}

// 패배 창
function lose_page(stage) {

    console.clear();
    console.log(
        chalk.red(
            figlet.textSync(`You lose`, {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );
    const choice = readlineSync.question(chalk.greenBright(`\n ${stage}스테이지를 다시 하시겠습니까? [y/n] `));
    if (choice === "y") {
        return choice;
    } else if (choice === "n") {
        return choice;
    } else {
        lose_page(stage);
    }

}

export async function startGame() {
    console.clear();
    const player = new Player();
    let stage = 1;
    isQuit = false;

    while (stage) {
        const monster = new Monster(stage);
        let battle_result = await battle(stage, player, monster);
        if (battle_result === "again") {
            stage--;
        } else if (battle_result === "giveup") {
            break;
        } else if (battle_result === "quit") {
            isQuit = true;
            break;
        }

        if (battle_result === "win") {
            if (stage === 1) {
                makeData(stage);
            } else {
                updateData(stage);
            }
            clearReword(player);
        } else if (battle_result === "lose") {
            let lose_choice = lose_page(stage)
            if (lose_choice == "y") {
                stage--;
            } else if (lose_choice == "n") {
                break;
            }
        }

        // 스테이지 클리어 및 게임 종료 조건

        stage++;
    }
}

// chcp 65001