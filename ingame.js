// 데미지 계산 함수
export function damageCalculator(attacker, defender) {
    let result = Math.floor(attacker.attack_damage * (1 - (1.5 * defender.defensive_power / (1.5 * defender.defensive_power + attacker.attack_damage))));
    return result;
}

// 몬스터 행동 함수
export function getMonsterMove() {
    let attack_probability = Math.floor(Math.random() * 60) + 35
    let defense_probability = 100 - attack_probability;
    let result = Math.floor(Math.random() * 100) + 1
    if (result < attack_probability) {
        result = "attack";
    } else {
        result = "defense";
    }
    return [attack_probability, defense_probability, result];
}

// 전투전 체력, 스킬횟수 초기화 함수
export function resetStatus(player, monster) {
    player.hp = player.max_hp;
    player.double_attack_count = player.max_double_attack_count;
    player.defense_counter_count = player.max_defense_counter_count;
    player.defense_count = player.max_defense_count;
    player.heal_count = player.max_heal_count;
    monster.hp = monster.max_hp;
}
