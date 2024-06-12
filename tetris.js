// 테트리스 게임을 위한 캔버스와 컨텍스트 가져오기
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

// 게임 보드 및 다음 블록 화면의 크기 설정
const scale = 30; // 게임 보드 블록 크기
const rows = 20; // 게임 보드의 행 수
const cols = 10; // 게임 보드의 열 수

canvas.width = cols * scale; // 게임 보드 너비
canvas.height = rows * scale; // 게임 보드 높이

context.scale(scale, scale); // 게임 보드 스케일 설정

const nextScale = 6; // 다음 블록 화면 스케일
nextCanvas.width = 4 * nextScale; // 다음 블록 화면 너비
nextCanvas.height = 4 * nextScale; // 다음 블록 화면 높이

nextContext.scale(nextScale, nextScale); // 다음 블록 화면 스케일 설정

// 게임 보드 초기화
const arena = createMatrix(cols, rows);

// 플레이어 초기 설정
const player = {
    pos: { x: 0, y: 0 }, // 현재 위치
    matrix: null, // 현재 블록 모양
    next: null, // 다음 블록 모양
    score: 0, // 점수
};

// 블록 색상 배열
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

// 행렬(게임 보드)을 생성하는 함수
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0)); // 0으로 채워진 행 추가
    }
    return matrix;
}

// 블록을 생성하는 함수
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

// 행렬(블록)을 캔버스에 그리는 함수
function drawMatrix(matrix, offset, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                ctx.strokeStyle = '#FFFFFF'; // 블록 윤곽선 색상
                ctx.lineWidth = 0.05; // 윤곽선 두께
                ctx.strokeRect(x + offset.x, y + offset.y, 1, 1); // 윤곽선 그리기
            }
        });
    });
}

// 게임 보드의 그리드 라인 그리기
function drawBoard() {
    context.strokeStyle = '#555';
    context.lineWidth = 0.05;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            context.strokeRect(x, y, 1, 1);
        }
    }
}

// 전체 화면을 그리는 함수
function draw() {
    context.fillStyle = '#000'; // 배경색
    context.fillRect(0, 0, canvas.width, canvas.height); // 배경 그리기

    drawBoard(); // 보드 그리기
    drawMatrix(arena, { x: 0, y: 0 }); // 게임 보드 그리기
    drawMatrix(player.matrix, player.pos); // 현재 블록 그리기
}

// 다음 블록 화면 그리기
function drawNext() {
    nextContext.fillStyle = '#000'; // 배경색
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height); // 배경 그리기
    drawMatrix(player.next, { x: 1, y: 1 }, nextContext); // 다음 블록 그리기, 위치 조정
}

// 현재 블록을 게임 보드에 합치는 함수
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// 블록을 아래로 떨어뜨리는 함수
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) { // 충돌 시 처리
        player.pos.y--;
        merge(arena, player); // 현재 블록을 게임 보드에 합치기
        playerReset(); // 플레이어 초기화
        arenaSweep(); // 완성된 줄 지우기
        updateScore(); // 점수 업데이트
        dropInterval = Math.max(100, 1000 - (player.score * 5)); // 점수에 따라 속도 증가, 최소 속도 제한
    }
    dropCounter = 0;
}

// 블록을 좌우로 이동시키는 함수
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// 새로운 블록을 가져오는 함수
function playerReset() {
    if (player.next === null) {
        player.next = createPiece('TJLOSZI'[Math.random() * 7 | 0]); // 랜덤 블록 생성
    }
    player.matrix = player.next;
    player.next = createPiece('TJLOSZI'[Math.random() * 7 | 0]); // 다음 블록 생성
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) { // 충돌 시 게임 오버
        arena.forEach(row => row.fill(0));
        player.score = 0; // 점수 초기화
        updateScore();
        dropInterval = 1000; // 드롭 간격 초기화
    }
    drawNext(); // 다음 블록 그리기
}

// 블록을 회전시키는 함수
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// 행렬을 회전시키는 함수
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// 완성된 줄을 지우는 함수
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0); // 줄 삭제
        arena.unshift(row); // 빈 줄 추가
        ++y;

        player.score += rowCount * 10; // 점수 추가
        rowCount *= 2;
    }
}

// 충돌 감지 함수
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

let dropCounter = 0; // 드롭 타이머
let dropInterval = 1000; // 드롭 간격
let lastTime = 0; // 마지막 프레임 시간

// 게임 상태를 업데이트하는 함수
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw(); // 화면 그리기
    requestAnimationFrame(update); // 다음 프레임 요청
}

// 점수 업데이트 함수
function updateScore() {
    document.getElementById('score').innerText = player.score;
}

// 키보드 이벤트 처리
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1); // 왼쪽 이동
    } else if (event.keyCode === 39) {
        playerMove(1); // 오른쪽 이동
    } else if (event.keyCode === 40) {
        playerDrop(); // 아래로 이동
    } else if (event.keyCode === 81) {
        playerRotate(-1); // 왼쪽 회전
    } else if (event.keyCode === 87) {
        playerRotate(1); // 오른쪽 회전
    } else if (event.keyCode === 32) {
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(arena, player); // 블록 합치기
        playerReset(); // 새로운 블록 생성
        arenaSweep(); // 완성된 줄 지우기
        updateScore(); // 점수 업데이트
    }
});

// 버튼 클릭 이벤트 처리
document.getElementById('left').addEventListener('click', () => playerMove(-1));
document.getElementById('right').addEventListener('click', () => playerMove(1));
document.getElementById('down').addEventListener('click', () => playerDrop());
document.getElementById('rotate').addEventListener('click', () => playerRotate(1));

// 게임 초기화 및 시작
playerReset();
updateScore();
update();
