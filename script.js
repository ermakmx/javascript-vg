window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;
    // En esta parte se configura e inicializa el manejo de las teclas que se usan en el juego
    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                
                if(( (e.key === 'ArrowDown') || (e.key === 'ArrowUp') )&& this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                }else if(e.key === ' '){
                    this.game.player.shootTop();
                }else if(e.key === 'r'){
                    this.game.debug = !this.game.debug;
                }
            });

            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key)>-1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1);
                }
            })
        }
    }
// Esta clase se inicializa el disparo.
    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 4;
            this.speed = 20;// se cambia la velocidad del proyectil a mas rapido
            this.markedForDeletion = false;
        }

        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.4){ // se cambia el rango del proyectile a mas corto
                this.markedForDeletion = true;
            }
        }

        draw(context){
            context.fillStyle = 'white'; // se cambia el color del disparo a blanco
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

// Aqui se inicializa el jugador y sus propiedades
    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 10; // se le aumenta la velocidad maxima al personaje 
            this.projectiles = [];
            this.img = document.getElementById('player');
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }

        update(){
            if(this.game.keys.includes('ArrowUp')){
                this.speedY = -this.maxSpeed;
            }else if(this.game.keys.includes('ArrowDown')){
                this.speedY = this.maxSpeed;
            }else{
                this.speedY = 0;
            }
            this.y += this.speedY;
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            
            if(this.frameX < this.maxFrame) this.frameX ++
            else this.frameX = 0;
        }

        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.img, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height
            );
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            })
        }

        shootTop(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            }
        }
    }
// Aqui se inicializan los enemigos con sus propiedades
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * - 10 - 2;  //se le aumenta la velocidad a los enemigos
            this.markedForDeletion = false;
            this.lives = 3;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }

        update(){
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0) this.markedForDeletion = true;
            if(this.frameX < this.maxFrame){
                this.frameX++;
            }else {
                this.frameX = 0;
            }
        }

        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height
            )
            context.fillStyle = 'black';
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    }
    // Aqui se hereda de un enemigo comun y se inicializa un pez pequeño de dos de vida
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 2
        }
    }
 // Aqui se hereda de un enemigo comun y se inicializa un pez mediano de tres de vida
    class Angler2 extends Enemy {
        constructor(game){
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
        }
    }
 // Aqui se hereda de un enemigo comun y se inicializa un pez de la suerte de tres de vida
    class Lucky extends Enemy {
        constructor(game){
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = 15;
            this.type = 'luck';
        }
    }
 // Aqui esta el padre de las capas usadas en el juego, mismas que tienen propiedades modificables.
    class Layer {
        constructor(game, image, speedModify){
            this.game = game;
            this.image = image;
            this.speedModify = speedModify;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update(){
            if(this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModify;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y + this.height)
        }
    }
 // Aqui se genera el background juntando las capas y sus diferentes velocidades
    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.3);
            this.layer2 = new Layer(this.game, this.image2, 0.5);
            this.layer3 = new Layer(this.game, this.image3, 1.3);
            this.layer4 = new Layer(this.game, this.image4, 1.8);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }

        update(){
            this.layers.forEach(layer => layer.update());
        }

        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }
 // Aqui se crea lo que muestra arriba, la puntuacion, la municion, si el juego termina y sus mensajes, etc.
    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }

        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            
            context.font = this.fontSize; + 'px ' + this.fontFamily;
            context.fillText('Score: ' + this.game.score, 20, 40);

            for(let i=0; i<this.game.ammo; i++){
                context.fillRect(20 + i * 6 + 3, 50, 3, 20);
            }
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);

            if(this.game.gameOver){
                context.textAlign = 'center';
                let msg1;
                let msg2;

                if(this.game.score > this.game.winningScore){
                    msg1 = 'You Win!'
                    msg2 = "Hell yeah!"
                }else {
                    msg1 = 'You Lose';
                    msg2 = 'Give up';
                }

               
                context.font = '60px ' + this.fontFamily; 
                context.fillStyle = 'Red'; // se le cambia el color al texto con el que termina el juego
                context.fillText(msg1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(msg2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }
            context.restore();
        }
    }
 // Aqui se genera y se crea todo el sistema de juego 
    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.background = new Background(this);
            this.keys = [];
            this.ammo = 100;  // se le aumenta la municion cuando comienza
            this.ammoTimer = 0;
            this.ammoInterval = 600;
            this.maxAmmo = 200;  // se le aumenta lo maximo de municion
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 800; //aumenta la velocidad de salida de los enemigos
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 60; // se le aumenta la puntuacion para ganar para ganar
            this.gameTime = 0;
            this.timeLimit = 30000;
            this.speed = 1;
            this.debug = false;
        }

        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update();
            if(this.ammoTimer > this.ammoInterval){
                if(this.ammo < this.maxAmmo){
                    this.ammo++;
                    this.ammoTimer = 0;
                }
                
            }else{
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if(enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            if(!this.gameOver) this.score += enemy.score;
                            if(this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            })

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            }else {
                this.enemyTimer += deltaTime;
            }
        }

        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
            this.background.layer4.draw(context);
        }

        checkCollision(rect1, rect2){
            return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width >
                rect2.x && rect1.y + rect2.y + rect2.height && rect1.height + rect1.y
                > rect2.y
            )
        }

        addEnemy(){
            const randomize = Math.random();
            if(randomize < 0.3) this.enemies.push(new Angler1(this));
            else if(randomize < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new Lucky(this));
        }

    }
    //   Aqui se inicializa el juego para comenzar a jugar
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp-lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    // comienza el juego y se inicializa con el tiempo de timeStamp
    animate(0);
});