window.onload = function () {
  var startButton = document.getElementById("start-button");
  startButton.addEventListener("click", begin);
  var audio;
  let play = document.getElementById("start-button");
  function playMusic() {
    audio = new Audio("Brave-pilots.ogg");
    audio.loop = true;
    audio.play();
  }
  play.addEventListener("click", playMusic);

  var volumeSlider = document.getElementById("volume-slider");
  volumeSlider.addEventListener("input", function () {
    // Aktualizuj głośność na podstawie wartości suwaka
    updateVolume(volumeSlider.value);
  });

  function updateVolume(volume) {
    if (audio) {
      // Gwarantuj, że wartość głośności jest w odpowiednim zakresie (0-1)
      volume = Math.max(0, Math.min(100, volume)) / 100;
      audio.volume = volume;
    }
  }
  function begin() {
    var startScreen = document.getElementById("start-screen");
    startScreen.innerHTML = ""; // Usunięcie zawartości diva startowego

    var canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    canvas.width = 100;
    canvas.height = 100;

    startScreen.appendChild(canvas);

    // Tutaj można umieścić resztę kodu gry, który byłby wywoływany po kliknięciu przycisku
    // Możesz przenieść kod tworzenia gry tutaj
    // ...

    // Przykładowy kod rysujący na canvasie po jego utworzeniu

    var c = document.querySelector("canvas");
    var canvas = document.querySelector("canvas");
    c.width = innerWidth;
    c.height = innerHeight;
    c = c.getContext("2d");
    function startGame() {
      var gamePaused = false; // Dodanie zmiennej do śledzenia stanu gry (pauza / niepauza)
      mouse = {
        x: innerWidth / 2,
        y: innerHeight - 33,
      };

      touch = {
        x: innerWidth / 2,
        y: innerHeight - 33,
      };

      canvas.addEventListener("mousemove", function (event) {
        mouse.x = event.clientX;
      });

      canvas.addEventListener("touchmove", function (event) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        var touch = event.changedTouches[0];
        var touchX = parseInt(touch.clientX);
        var touchY = parseInt(touch.clientY) - rect.top - root.scrollTop;
        event.preventDefault();
        mouse.x = touchX;
        mouse.y = touchY;
      });
      var player_width = 16;
      var player_height = 16;
      var playerImg = new Image();
      var score = 0;
      var gears = 0;
      var difficultyLevel = 1;
      var health = 100;
      playerImg.src = "SpaceShip.png";

      var _stars = [];
      var star_radius = 1;
      var star_height = 0;
      var star_speed = 0.5;

      var _bullets = [];
      var bullet_width = 6;
      var bullet_height = 8;
      var bullet_speed = 10;

      var _enemies = [];
      var enemyImg = new Image();
      enemyImg.src = "Alien_ship.png";
      var enemy_width = 38; //w rzeczywistości sprite wynosi 38 pixeli
      var enemy_height = 38;

      var _healthkits = [];
      var healthkitImg = new Image();
      healthkitImg.src = "HealthStar.png";
      var healthkit_width = 28;
      var healthkit_height = 28;

      var _gears = [];
      var gearImg = new Image();
      gearImg.src = "Gear.png";
      var gear_width = 28;
      var gear_height = 28;
      // var gear_speed;

      function Player(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.draw = function () {
          c.beginPath();
          c.drawImage(
            playerImg,
            mouse.x - player_width,
            mouse.y - player_height
          );
        };

        this.update = function () {
          this.x = mouse.x - player_width;
          this.y = mouse.y - player_height;
          this.draw();
        };
      }

      function Star(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;

        this.draw = function () {
          c.beginPath();
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          c.fillStyle = "white";
          c.fill();
        };

        this.update = function () {
          this.y += this.speed;
          this.draw();
        };
      }

      function Bullet(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;

        this.draw = function () {
          c.beginPath();
          c.rect(this.x, this.y, this.width, this.height);
          c.fillStyle = "white";
          c.fill();
        };

        this.update = function () {
          this.y -= this.speed;
          this.draw();
        };
      }

      function Enemy(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;

        this.draw = function () {
          c.beginPath();
          c.drawImage(enemyImg, this.x - enemy_width / 10, this.y); //wyrównanie x przez width, bo jest trochę enemy sprite jest trochę krzywo nakładany
        };

        this.update = function () {
          this.y += this.speed;
          this.draw();
        };
      }

      function Healthkit(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;

        this.draw = function () {
          c.beginPath();
          c.drawImage(healthkitImg, this.x - healthkit_width / 10, this.y);
        };

        this.update = function () {
          this.y += this.speed;
          this.draw();
        };
      }

      function Gear(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;

        this.draw = function () {
          c.beginPath();
          c.drawImage(gearImg, this.x - gear_width / 10, this.y); //wyrównanie x przez width, bo jest trochę enemy sprite jest trochę krzywo nakładany
        };

        this.update = function () {
          this.y += this.speed;
          this.draw();
        };
      }

      var __player = new Player(mouse.x, mouse.y, player_width, player_height);

      //funkcja spawnująca gwiazdy
      function drawStars(starting) {
        if (!gamePaused) {
          for (var _ = 0; _ < 400; _++) {
            var x = Math.random() * (innerWidth - star_radius);
            var y;
            if (starting) {
              y = Math.random() * innerHeight;
              // console.log("starting stars");
            } else {
              y = star_height;
              _ = _ + 10;
            }
            var width = star_radius;
            var speed = Math.random() * star_speed;
            var __star = new Star(x, y, width, speed);
            _stars.push(__star);
          }
        }
      }
      drawStars(true);
      setInterval(drawStars, 2000);

      function updateDifficultyLevel(score) {
        if (score % (25 * Math.pow(difficultyLevel, 2)) === 0) {
          difficultyLevel++;
          //  console.log("Level up! Difficulty increased to " + difficultyLevel);
          //showOverlay();
        }
      }
      function drawEnemies() {
        if (!gamePaused) {
          for (var _ = 0; _ < difficultyLevel; _++) {
            var x = Math.random() * (innerWidth - enemy_width);
            var y = -enemy_height;
            var width = enemy_width;
            var height = enemy_height;
            var speed = Math.random() * 2;
            var __enemy = new Enemy(x, y, width, height, speed);
            _enemies.push(__enemy);
          }
        }
      }
      setInterval(drawEnemies, 1234);

      function drawHealthkits() {
        if (!gamePaused) {
          for (var _ = 0; _ < 1; _++) {
            var x = Math.random() * (innerWidth - enemy_width);
            var y = -enemy_height;
            var width = healthkit_width;
            var height = healthkit_height;
            var speed = Math.random() * 2.6;
            var __healthkit = new Healthkit(x, y, width, height, speed);
            _healthkits.push(__healthkit);
          }
        }
      }
      setInterval(drawHealthkits, 15000);

      function fire() {
        if (!gamePaused) {
          for (var _ = 0; _ < 1; _++) {
            var x = mouse.x + player_width / 2 - bullet_width / 2;
            var y = mouse.y - player_height;
            var __bullet = new Bullet(
              x,
              y,
              bullet_width,
              bullet_height,
              bullet_speed
            );
            _bullets.push(__bullet);
          }
          // console.log(__player.x);
        }
      }
      canvas.addEventListener("click", function () {
        fire();
      });
      // canvas.addEventListener("click", function () {}); - nie wiem czy to po coś tu było, ale zostawiam w kom żeby nie zepsuć xD

      function drawGears(x, y, speed) {
        var width = gear_width;
        var height = gear_height;
        var speed = speed;
        var __gear = new Gear(x, y, width, height, speed);
        _gears.push(__gear);
      }

      function killEnemy(enemyNumber) {
        // console.log(enemyNumber);
        if (Math.random() < 0.2) {
          drawGears(
            _enemies[enemyNumber].x,
            _enemies[enemyNumber].y,
            _enemies[enemyNumber].speed
          );
          // console.log("Gear");
        }
        _enemies.splice(enemyNumber, 1);
      }

      function collision(a, b) {
        return (
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        );
      }
      //  c.font = "1em Arial"; // po cholerę ta linijka?

      function stoperror() {
        return true;
      }
      window.onerror = stoperror;
      window.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          gamePaused = !gamePaused; // Zmień stan gry (pauza / niepauza)
          togglePauseMenu();
          animate();
        }
      });
      function togglePauseMenu() {
        var gameOverlay = document.getElementById("game-overlay");
        //var pauseMenu = document.getElementById("pause-menu"); nieaktualna zmienna

        if (gamePaused) {
          gameOverlay.style.display = "flex";
          //pauseMenu.innerHTML = "<p>Pause</p>"; //ustawianie zawartości diva w htmlu - nie działa bo przykrywa suwak głośności
        } else {
          gameOverlay.style.display = "none";
        }
      }

      function showOverlay() {
        var overlay = document.getElementById("overlay");
        overlay.style.display = "flex";
        overlay.style.background = "rgba(0, 0, 0, 0.5)"; // Zaciemnienie z alpha 0.5
      }

      function hideOverlay() {
        var overlay = document.getElementById("overlay");
        overlay.style.background = "rgba(0, 0, 0, 0)"; // Transparentne tło
      }

      function animate() {
        if (!gamePaused) {
          requestAnimationFrame(animate); // alternatywa dla SetInterval, wywołuję funkcję animate przy każdym odświeżeniu ekranu
        }
        c.beginPath();
        c.clearRect(0, 0, innerWidth, innerHeight);
        c.fillStyle = "white";
        c.font = "1em 'Press Start 2P'";
        c.fillText("Health: " + health, 15, 25);
        c.fillText("Score: " + score, 15, 45);
        c.fillText("Gears: " + gears, 15, 65);

        __player.update();

        for (var i = 0; i < _stars.length; i++) {
          _stars[i].update();
          if (_stars[i].y > innerHeight) {
            _stars.splice(i, 1);
          }
        }

        for (var i = 0; i < _bullets.length; i++) {
          _bullets[i].update();
          if (_bullets[i].y < 0) {
            _bullets.splice(i, 1);
          }
        }

        for (var k = 0; k < _enemies.length; k++) {
          _enemies[k].update();
          if (_enemies[k].y > innerHeight) {
            _enemies.splice(k, 1);
            health -= 10;
            if (health == 0) {
              alert("You LOST! \n Your score was " + score);
              startGame();
            }
          }
        }
        for (var g = 0; g < _gears.length; g++) {
          _gears[g].update();
          if (_gears[g].y > innerHeight) {
            _gears.splice(g, 1);
          }
        }

        for (var j = _enemies.length - 1; j >= 0; j--) {
          for (var l = _bullets.length - 1; l >= 0; l--) {
            if (collision(_enemies[j], _bullets[l])) {
              killEnemy(j);
              _bullets.splice(l, 1);
              score++;
              updateDifficultyLevel(score);
            }
          }
        }
        for (var h = 0; h < _healthkits.length; h++) {
          _healthkits[h].update();
        }
        for (var hh = _healthkits.length - 1; hh >= 0; hh--) {
          for (var hhh = _bullets.length - 1; hhh >= 0; hhh--) {
            if (collision(_healthkits[hh], _bullets[hhh])) {
              _healthkits.splice(hh, 1);
              _bullets.splice(hhh, 1);
              health += 10;
            }
          }
        }
        for (var gg = _gears.length - 1; gg >= 0; gg--) {
          if (collision(__player, _gears[gg])) {
            _gears.splice(gg, 1);
            gears += 1;
            //console.log("gear collected");
          }
          for (var ggg = _bullets.length - 1; ggg >= 0; ggg--) {
            if (collision(_gears[gg], _bullets[ggg])) {
              _gears.splice(gg, 1);
              _bullets.splice(ggg, 1); //dodać animację niszczenia zębatek
            }
          }
        }
      }
      animate();
    }

    startGame();
  }
};
