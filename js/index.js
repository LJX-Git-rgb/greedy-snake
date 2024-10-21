const SQUARE_WIDTH = 20, SQUARE_HEIGHT = 20, ROWS = 30, COLUMNS = 30;
//全局变量 X,Y--蛇初始化的位置 speedTime--速度,score--得分
let X = parseInt(Math.random() * 24) + 3, Y = parseInt(Math.random() * 24) + 3, speedTime = 50, score = 0;

/**
 * [Square description]
 * @param {[int]} x         [方块的横向位置(1--29))]
 * @param {[int]} y         [方块的纵向位置(1--29))]
 * @param {[String]} className [代表方块的类名(样式)]
 * x,y是方块的位置第一个是(1,0),第二个(2,0),不以像素存是为了之后方便存在数组中
 */
function Square(x, y, className) {
    this.x = x;
    this.y = y;
    this.left = x * SQUARE_WIDTH;
    this.top = y * SQUARE_HEIGHT;
    this.className = className;

    //创建一个div,类选择器为形参className
    this.viewContent = document.createElement('div');
    this.viewContent.className = className;
    //获取div的父类也就是snakeWrap
    this.parent = document.getElementById('snakeWrap');
}

/**
 *    方块初始化函数
 *        设置方块的一些CSS样式
 *        将方块加到父级snakeWrap中显示
 *    @return {[type]} [description]
 */
Square.prototype.init = function () {
    //初始化小方块
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = SQUARE_WIDTH + "px";
    this.viewContent.style.height = SQUARE_HEIGHT + 'px';
    //方块的left,top单位是像素
    this.viewContent.style.left = this.left + 'px';
    this.viewContent.style.top = this.top + 'px';
    //将小方块加入父级中
    this.parent.appendChild(this.viewContent);
};
/**
 * 将小方块从父类中移除
 * @return {[type]} [description]
 */
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
};

/**
 * 🐍[Snake description]
 * 创建蛇头head,蛇尾tail,构成蛇的方块的集合pos
 * 装载蛇行进方向的集合directionNum
 * 蛇行进方向direction
 */
function Snake() {
    //头
    this.head = null;
    //尾
    this.tail = null;
    //其他身体
    this.pos = [];
    //用对象装载贪吃蛇的方向
    this.directionNum = {
        left: {
            x: -1, y: 0, rotate: 180
        }, right: {
            x: 1, y: 0, rotate: 0
        }, up: {
            x: 0, y: -1, rotate: -90
        }, down: {
            x: 0, y: 1, rotate: 90
        }
    }
    //贪吃蛇目前的方向
    this.direction = this.directionNum.right;
}

/**
 * [init description]
 * @return {[type]} [description]
 * 创建一条蛇
 *        蛇头位置随机生成
 *        蛇尾和蛇身根据蛇头位置生成
 */
Snake.prototype.init = function () {
    //创建🐍头
    let snakeHead = new Square(X, Y, 'snakeHead');
    //存储蛇头信息
    this.head = snakeHead;

    //创建🐍身体
    let snakeBody = new Square(X - 1, Y, 'snakeBody');

    //创建🐍尾
    let snakeTail = new Square(X - 2, Y, 'snakeBody');
    //存储蛇尾信息
    this.tail = snakeTail;

    //初始化蛇方块
    snakeHead.init();
    snakeBody.init();
    snakeTail.init();

    //将身体的三个节点装到数组中
    this.pos.push([X, Y]);
    this.pos.push([X - 1, Y]);
    this.pos.push([X - 2, Y]);

    //将蛇身体形成链表关系
    snakeHead.pro = null;
    snakeHead.next = snakeBody;
    snakeBody.pro = snakeHead;
    snakeBody.next = snakeTail;
    snakeTail.pro = snakeBody;
    snakeTail.next = null;
};
/**
 * 获取蛇头下一个位置的元素,根据元素做不同的事情
 * @return {[type]} [description]
 */
Snake.prototype.getNextPos = function () {
    let nextPos = [this.head.left / SQUARE_WIDTH + this.direction.x, this.head.top / SQUARE_HEIGHT + this.direction.y]

    //下个点是自己
    for (let p in this.pos) {
        if (this.pos[p].toString() === nextPos.toString()) {
            console.log('撞到自己了');
            this.strategies.die.call(this);
            return;
        }
    }

    //下个点是墙
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > ROWS - 1 || nextPos[1] > COLUMNS - 1) {
        console.log('撞到墙了');
        this.strategies.die.call(this);
        return;
    }
    //下个点是食物
    if (nextPos.toString() === game.food.toString()) {
        score++;
        console.log('吃到食物了');
        this.strategies.eat.call(this);
        food.remove();
        food = createFood();
        game.food = [food.left / SQUARE_WIDTH, food.top / SQUARE_HEIGHT];
        return;
    }
    //下个点什么都没有
    this.strategies.move.call(this);
    return nextPos;
}
/**
 *    贪吃蛇活动的对象
 *        死--吃--走
 */
Snake.prototype.strategies = {
    die: function () {
        alert('您的得分是' + score + '!');
        game.gameOver();
    }, eat: function () {
        //将头向移动的方向迁移一个位置
        this.head.viewContent.style.left = parseInt(this.head.viewContent.style.left) + SQUARE_WIDTH * this.direction.x + "px";
        this.head.viewContent.style.top = parseInt(this.head.viewContent.style.top) + SQUARE_HEIGHT * this.direction.y + "px";

        //新建一个div方块,位置在旧头部
        let newBody = new Square(this.head.left / SQUARE_HEIGHT, this.head.top / SQUARE_WIDTH, 'snakeBody');
        //新节点补上旧头位置
        newBody.init();

        //改变链表关系
        this.head.next.pro = newBody;
        newBody.pro = this.head;
        newBody.next = this.head.next;
        this.head.next = newBody;

        //改变方块属性
        this.head.left = parseInt(this.head.viewContent.style.left);
        this.head.top = parseInt(this.head.viewContent.style.top);

        this.head.x += this.direction.x;
        this.head.y += this.direction.y;

        //改变pos
        this.pos.splice(0);
        let p = snake.head;
        while (p.next != null) {
            this.pos.push([p.x, p.y]);
            p = p.next;
        }
    }, move: function () {
        let headX = this.head.viewContent.style.left, headY = this.head.viewContent.style.top, newTail = this.tail.pro;
        newTail.next = null;
        //蛇头向移动方向前进一格
        this.head.viewContent.style.left = parseInt(this.head.viewContent.style.left) + SQUARE_WIDTH * this.direction.x + "px";
        this.head.viewContent.style.top = parseInt(this.head.viewContent.style.top) + SQUARE_HEIGHT * this.direction.y + "px";
        if (this.direction !== this.directionNum.left) {
            this.head.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
        } else {
            this.head.viewContent.style.transform = 'rotateY(' + this.direction.rotate + 'deg)';
        }
        //把蛇尾巴移动到旧蛇头位置
        this.head.next.pro = this.tail;
        this.tail.next = this.head.next;
        this.head.next = this.tail;
        this.tail.pro = this.head;

        this.tail.viewContent.style.left = headX;
        this.tail.viewContent.style.top = headY;

        this.head.left = parseInt(this.head.viewContent.style.left);
        this.head.top = parseInt(this.head.viewContent.style.top);
        this.tail.left = parseInt(this.tail.viewContent.style.left);
        this.tail.top = parseInt(this.tail.viewContent.style.top);

        this.tail.x = this.head.x;
        this.tail.y = this.head.y;
        this.head.x += this.direction.x;
        this.head.y += this.direction.y;

        this.tail = newTail;
        //
        this.pos.splice(0);
        let p = snake.head;
        while (p != null) {
            this.pos.push([p.x, p.y]);
            p = p.next;
        }
    }
}

function createFood() {
    let food = new Square(parseInt(Math.random() * 27) + 3, parseInt(Math.random() * 27) + 3, "food");
    food.init();
    return food;
}

function Game() {
    let timer = null;
    let score = 0;
    let food = null;
}

Game.prototype.init = function () {
    snake.init();
    food = createFood();
    this.food = [food.left / SQUARE_WIDTH, food.top / SQUARE_HEIGHT];
    document.onkeydown = function (ev) {
        if (ev.which === 37 && snake.direction !== snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which === 38 && snake.direction !== snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which === 39 && snake.direction !== snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which === 40 && snake.direction !== snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        } else {

        }
    }
    this.start();
};
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, speedTime);
};
Game.prototype.pause = function () {
    this.timer = null;
};
Game.prototype.gameOver = function () {
    clearInterval(this.timer);
    let snakeWrap = document.getElementById("snakeWrap");
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    let start = document.getElementsByClassName("startBtn")[0];
    start.style.display = "block";
};
let snake = new Snake();
let food = null;
let game = null;
let start = document.getElementsByClassName("startBtn")[0];
let pause = document.getElementsByClassName("pauseBtn")[0];
start.addEventListener('click', startGame, false);

function startGame(e) {
    game = new Game();
    score = 0;
    game.init();
    start.style.display = "none";
    pause.style.display = "none";
    e.stopPropagation()
}

pause.addEventListener('click', continueGame, false);

function continueGame(e) {
    pause.style.display = "none";
    game.start();
    e.stopPropagation()
}

document.addEventListener('click', pauseGame, false);

function pauseGame() {
    clearInterval(game.timer);
    if (start.style.display.toString !== "none") {
        pause.style.display = "block";
    }
}