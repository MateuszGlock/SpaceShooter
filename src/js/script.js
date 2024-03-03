//function for all code
window.onload = function () {
  //buttons and slider and what they do

  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", begin);
  startButton.addEventListener("click", playMusic);

  let volumeSlider = document.getElementById("volume-slider");
  volumeSlider.value = 10; //beginning volume
  volumeSlider.addEventListener("input", function () {
    updateVolume(volumeSlider.value);
  });

  let tutorialButton = document.getElementById("tutorial-button");
  tutorialButton.addEventListener("click", toggleTutorialModal);

  let closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", toggleTutorialModal);

  //variables and function for music and sounds

  let backgroundMusic = new Audio("src/audio/Brave-pilots.ogg");
  let shooting_sound = new Audio("src/audio/mixkit-game-whip-shot-1512.wav");
  let enemy_explosion_sound = new Audio(
    "src/audio/mixkit-short-explosion-1694.wav"
  );
  let gear_sound = new Audio(
    "src/audio/mixkit-dropping-keys-in-the-floor-2839.wav"
  );
  let star_sound = new Audio(
    "src/audio/mixkit-extra-bonus-in-a-video-game-2045.wav"
  );

  function playMusic() {
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.1; //beggining background volume
    backgroundMusic.play();
  }

  function updateVolume(volume) {
    if (backgroundMusic) {
      volume = Math.max(0, Math.min(100, volume)) / 100; //converting volume slider value to 0-1
      backgroundMusic.volume = volume;
    }
  }

  //modal craziness

  function toggleTutorialModal() {
    const tutorialModal = document.getElementById("tutorial-modal");

    if (tutorialModal.style.display === "") {
      tutorialModal.style.display = "flex";
      tutorialModal.classList.remove("hide-modal");
    } else {
      //starting animation for closing modal
      tutorialModal.classList.add("hide-modal");

      //after animation close modal
      tutorialModal.addEventListener(
        "transitionend",
        function () {
          tutorialModal.style.display = "";
        },
        { once: true } //deleting Event Listener after using it
      );
    }
  }

  function begin() {
    //setup for gameplay
    const startScreen = document.getElementById("start-screen");
    startScreen.innerHTML = "";
    let canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    startScreen.appendChild(canvas);

    let drawingCanvas = document.querySelector("canvas");
    drawingCanvas.width = innerWidth;
    drawingCanvas.height = innerHeight;
    drawingCanvas = drawingCanvas.getContext("2d");

    //setup for mobile devices - TO DO
    let isTouchDevice = "ontouchstart" in document.documentElement;
    const shootButton = document.createElement("button");
    shootButton.id = "shoot-button";
    shootButton.classList.add("shoot-button");
    const upgradesButton = document.createAttribute("button");
    upgradesButton.id = "upgrade-button";

    if (isTouchDevice) {
      startScreen.appendChild(shootButton);
      // startScreen.appendChild(upgradesButton);
      // shootButton.addEventListener("click", fire);
    }
    //actual game beginning
    function startGame() {
      //variables for game and player abilities
      let gamePaused = false;
      let upgradesMenuOpen = false;
      let bulletCooldown = 1000; // cooldown in ms
      let lastShotTime = 0;
      let currentTime = 0;
      let spaceShipGunUpgradeLevel = 0;
      let enginesUpgradeLevel = 0;
      let bulletsUpgradeLevel = 0;
      let waveBreak = false;

      //object for upgrades list
      const upgradesData = {
        spaceShipGunUpgrade: {
          name: "Space Ship Gun Upgrade",
          cost: 5,
          purchase: function () {
            spaceShipGunUpgradeLevel++;
            bulletCooldown = 1000 / (spaceShipGunUpgradeLevel + 1);
          },
        },
        enginesUpgrade: {
          name: "Engines Upgrade",
          cost: 3,
          purchase: function () {
            enginesUpgradeLevel++;
            player_speed += enginesUpgradeLevel * 0.01;
          },
        },
        bulletsUpgrade: {
          name: "Bullets upgrade",
          cost: 4,
          purchase: function () {
            bulletsUpgradeLevel++;
          },
        },
      };

      //starting position for player ship
      mouse = {
        x: innerWidth / 2,
        y: innerHeight - 33,
      };

      touch = {
        x: innerWidth / 2,
        y: innerHeight - 33,
      };
      //updating postion of spaceship
      canvas.addEventListener("mousemove", function (event) {
        mouse.x = event.clientX;
      });

      canvas.addEventListener("touchmove", function (event) {
        let touch = event.changedTouches[0];
        let touchX = parseInt(touch.clientX);
        event.preventDefault();
        mouse.x = touchX;
        mouse.y = touchY;
      });

      //object variables
      let player_width = 16;
      let player_height = 16;
      let player_speed = 0.03;
      let playerImg = new Image();
      let score = 0;

      let gears = 0;
      let waveNumber = 1;
      let requiredScore = 15 + (waveNumber - 1) * 10;

      /**
       * 1. zespawnownanie przeciwnika 25 razy - 325
       * 2. sprawdzenie czy pozostał żywy przeciwnik
       * 3.
       *
       *
       *
       *
       *
       */
      let enemiesSpawned = 0;
      let health = 100;
      playerImg.src = "src/img/SpaceShip.png";

      const _stars = [];
      let star_radius = 1;
      var star_height = 0;
      let star_speed = 0.5;

      let _bullets = [];
      let bullet_width = 6;
      let bullet_height = 8;
      let bullet_speed = 10;

      let _enemies = [];
      let enemyImg = new Image();
      enemyImg.src = "src/img/Alien_ship.png";
      let enemy_width = 38;
      let enemy_height = 38;

      let _healthStars = [];
      let healthStarImg = new Image();
      healthStarImg.src = "src/img/HealthStar.png";
      let healthStar_width = 36;
      let healthStar_height = 36;

      let _gears = [];
      let gearImg = new Image();
      gearImg.src = "src/img/Gear.png";
      let gear_width = 28;
      let gear_height = 28;

      //all game object classes and function

      function Player(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        //drawing player spirte
        this.draw = function () {
          drawingCanvas.beginPath();
          drawingCanvas.drawImage(playerImg, this.x - player_width, this.y);
        };
        //animating a player movement - a nie mam siły już tego poprawiać, może kiedyś wrócę do upraszaczania tej funkcji
        this.update = function () {
          // Oblicz różnicę między pozycją docelową a aktualną pozycją gracza
          const deltaX = mouse.x - this.width / 2 - this.x;
          const deltaY = mouse.y - this.height / 2 - this.y;
          //zmienna dla prędkości
          let correctedSpeed = Math.min(
            player_speed * 100,
            Math.abs(this.speed * deltaX)
          );
          // Interpolacja liniowa dla płynnego poruszania się gracza
          this.x += Math.sign(deltaX) * correctedSpeed;
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
          drawingCanvas.beginPath();
          drawingCanvas.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          drawingCanvas.fill();
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
          drawingCanvas.beginPath();
          drawingCanvas.rect(this.x, this.y, this.width, this.height);
          drawingCanvas.fill();
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
          drawingCanvas.beginPath();
          drawingCanvas.drawImage(enemyImg, this.x - enemy_width / 10, this.y); //wyrównanie x przez width, bo jest trochę enemy sprite jest trochę krzywo nakładany
        };

        this.update = function () {
          this.y += this.speed;
          this.draw();
        };
      }

      function HealthStar(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;

        this.draw = function () {
          drawingCanvas.beginPath();
          //hitbox
          drawingCanvas.drawImage(
            healthStarImg,
            this.x - healthStar_width / 4,
            this.y
          );
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
          drawingCanvas.beginPath();
          drawingCanvas.drawImage(gearImg, this.x - gear_width / 10, this.y);
        };

        this.update = function () {
          this.y += this.speed;
          this.draw();
        };
      }

      const __player = new Player(
        mouse.x,
        mouse.y,
        player_width,
        player_height,
        player_speed
      );

      //drawing functions
      function drawStars(starting) {
        if (!gamePaused) {
          for (let _ = 0; _ < 400; _++) {
            let x = Math.random() * (innerWidth - star_radius);
            let y;
            if (starting) {
              y = Math.random() * innerHeight;
            } else {
              y = star_height;
              _ = _ + 10;
            }
            let width = star_radius;
            let speed = Math.random() * star_speed;
            let __star = new Star(x, y, width, speed);
            _stars.push(__star);
          }
        }
      }
      drawStars(true);
      setInterval(drawStars, 2000);

      function openWorkshop() {
        toggleOverlay("upgradeMenu");
        setTimeout(function () {
          toggleOverlay("upgradeMenu");
          waveBreak = false;
          scheduleDrawEnemies(requiredScore);
        }, 15000);
      }
      function drawEnemies() {
        if (!gamePaused) {
          for (let _ = 0; _ < waveNumber; _++) {
            let x = Math.random() * (innerWidth - enemy_width);
            let y = -enemy_height;
            let width = enemy_width;
            let height = enemy_height;
            let speed = Math.random() * 1.1 + 0.4;
            let __enemy = new Enemy(x, y, width, height, speed);
            _enemies.push(__enemy);
          }
        }
      }
      function scheduleDrawEnemies(requestedAmount) {
        const intervalId = setInterval(() => {
          drawEnemies();
          enemiesSpawned++;
          if (enemiesSpawned == requestedAmount) {
            waveBreak = true;
            waveNumber++;
            enemiesSpawned = 0;
            clearInterval(intervalId);
          }
        }, 3000);
      }

      scheduleDrawEnemies(requiredScore);

      function drawHealthStar() {
        if (!gamePaused) {
          for (let _ = 0; _ < 1; _++) {
            let x = Math.random() * (innerWidth - enemy_width);
            let y = -enemy_height;
            let width = healthStar_width;
            let height = healthStar_height;
            let speed = Math.random() * 2.6;
            let __healthStar = new HealthStar(x, y, width, height, speed);
            _healthStars.push(__healthStar);
          }
        }
      }
      setInterval(drawHealthStar, 15000);

      function drawGears(x, y, speed) {
        let width = gear_width;
        let height = gear_height;
        let __gear = new Gear(x, y, width, height, speed);
        _gears.push(__gear);
      }

      function fire() {
        if (!gamePaused) {
          currentTime = Date.now();
          if (currentTime - lastShotTime > bulletCooldown) {
            for (let _ = 0; _ < 1; _++) {
              let x = __player.x + bullet_width;
              let y = __player.y + player_height;
              let __bullet = new Bullet(
                x,
                y,
                bullet_width + bulletsUpgradeLevel * 2,
                bullet_height + bulletsUpgradeLevel * 2,
                bullet_speed
              );
              _bullets.push(__bullet);
              shooting_sound.play();
              lastShotTime = currentTime; // Zaktualizuj czas ostatniego strzału
              //updateShootButtonState();
            }
          }
        }
      }
      canvas.addEventListener("click", function () {
        fire();
      });
      //function for fire button for mobile devices - TO DO
      /*  function updateShootButtonState() {
        // Jeśli cooldown jest aktywny, dodaj klasę "cooldown" do przycisku
        if (currentTime - lastShotTime < bulletCooldown) {
          shootButton.classList.add("cooldown");
        } else {
          // Jeśli cooldown nie jest aktywny, usuń klasę "cooldown"
          shootButton.classList.remove("cooldown");
        }
      }
      shootButton.addEventListener("click", fire);
      shootButton.addEventListener("animationend", function () {
        // Usunięcie klasy cooldown po zakończeniu animacji
        shootButton.classList.remove("cooldown");
      });*/

      function killEnemy(enemyNumber) {
        const { x, y, speed } = _enemies[enemyNumber]; //destructuring
        if (Math.random() < 0.3) {
          //chance for gear to spawn
          drawGears(x, y, speed);
        }
        _enemies.splice(enemyNumber, 1);
        enemy_explosion_sound.play();
      }

      function collision(a, b) {
        return (
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        );
      }

      /*  function stoperror() {
        return true;
      }
      window.onerror = stoperror;*/

      //overlays craziness
      window.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          toggleOverlay("pauseMenu");
        }
        if (event.key === "e") {
          toggleOverlay("upgradeMenu");
        }
      });
      function toggleOverlay(overlayType) {
        let gameOverlay = document.getElementById("game-overlay");
        let pauseMenu = document.getElementById("pause-menu");
        let upgradeMenu = document.getElementById("upgrades-menu");

        for (let i = 0; i < gameOverlay.children.length; i++) {
          gameOverlay.children[i].style.display = "none";
        }

        switch (overlayType) {
          case "pauseMenu":
            if (gamePaused) {
              // Pauza jest włączona, więc wyłącz pauzę i odpauzuj grę
              gamePaused = false;
              animate();
              gameOverlayed = false;
              console.log("Pauza OFF");
              gameOverlay.style.display = "none";
              pauseMenu.style.display = "none";
            } else if (upgradesMenuOpen) {
              // Pauza jest wyłączona, ale menu upgradów jest otwarte
              gamePaused = true;
              upgradesMenuOpen = false;
              upgradeMenu.style.display = "none";
              pauseMenu.style.display = "block";
              console.log("Pauza z upgradów");
            } else {
              // Żaden overlay nie jest otwarty, więc włącz pauzę
              gameOverlayed = true;
              gamePaused = true;
              console.log("Pauza ON");
              gameOverlay.style.display = "flex";
              pauseMenu.style.display = "block";
            }
            break;
          case "upgradeMenu":
            if (gamePaused) {
              // Pauza jest włączona, więc wyłącz pauzę i odpauzuj grę
              gamePaused = false;
              animate();
              gameOverlayed = true;
              upgradesMenuOpen = true;
              pauseMenu.style.display = "none";
              upgradeMenu.style.display = "block";
              generateUpgradeTiles();
            } else if (upgradesMenuOpen) {
              // Pauza jest wyłączona, ale menu upgradów jest otwarte

              // gameOverlayed = false;
              upgradesMenuOpen = false;
              console.log(upgradeMenu);
              upgradeMenu.style.display = "none";
              console.log("upgrades OFF");
              gameOverlay.style.display = "none";
            } else {
              // Żaden overlay nie jest otwarty, więc menu upgradów
              gameOverlayed = true;
              gamePaused = false;
              upgradesMenuOpen = true;
              gameOverlay.style.display = "flex";
              upgradeMenu.style.display = "block";
              generateUpgradeTiles();
            }
            break;
          default:
            console.error("Nieznany typ overlaya:", overlayType);
        }
      }

      function generateUpgradeTiles() {
        const upgradesList = document.getElementById("upgrades-list");

        upgradesList.innerHTML = "";

        // Creating upgrade tiles
        Object.keys(upgradesData).forEach((upgradeKey) => {
          const upgrade = upgradesData[upgradeKey];
          const upgradeTile = document.createElement("li");

          const upgradeName = document.createElement("span");
          upgradeName.textContent = upgrade.name;

          const upgradeCost = document.createElement("span");
          upgradeCost.textContent = `Cost: ${upgrade.cost}`;

          const upgradeButton = document.createElement("button");
          upgradeButton.textContent = "Buy";
          upgradeButton.classList.add("upgrade-button");
          upgradeButton.addEventListener("click", () => {
            // Tutaj dodaj logikę zakupu ulepszenia

            handleUpgradePurchase(upgradeKey);
            // Po zakupie, ponownie generuj kafelki
            generateUpgradeTiles();
          });

          upgradeTile.appendChild(upgradeName);
          upgradeTile.appendChild(upgradeCost);
          upgradeTile.appendChild(upgradeButton);

          upgradesList.appendChild(upgradeTile);
        });
      }

      function handleUpgradePurchase(upgradeName) {
        const upgrade = upgradesData[upgradeName]; //computed properties
        if (gears >= upgrade.cost) {
          gears -= upgrade.cost;
          upgrade.purchase();
        } else {
          console.log(`Not enough gears to purchase ${upgradeName}`);
        }
      }

      //animate function for all movement on screen
      function animate() {
        if (!gamePaused) {
          requestAnimationFrame(animate); // alternatywa dla SetInterval, wywołuję funkcję animate przy każdym odświeżeniu ekranu
        }
        drawingCanvas.beginPath();
        drawingCanvas.clearRect(0, 0, innerWidth, innerHeight);
        drawingCanvas.fillStyle = "white";
        drawingCanvas.font = "1em 'Press Start 2P'";
        drawingCanvas.fillText("Health: " + health, 15, 25);
        drawingCanvas.fillText("Score: " + score, 15, 45);
        drawingCanvas.fillText("Gears: " + gears, 15, 65);

        __player.update();

        for (let i = 0; i < _stars.length; i++) {
          _stars[i].update();
          if (_stars[i].y > innerHeight) {
            _stars.splice(i, 1);
          }
        }

        for (let i = 0; i < _bullets.length; i++) {
          _bullets[i].update();
          if (_bullets[i].y < 0) {
            _bullets.splice(i, 1);
          }
        }

        for (let k = 0; k < _enemies.length; k++) {
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
        for (let g = 0; g < _gears.length; g++) {
          _gears[g].update();
          if (_gears[g].y > innerHeight) {
            _gears.splice(g, 1);
          }
        }

        for (let j = _enemies.length - 1; j >= 0; j--) {
          for (let l = _bullets.length - 1; l >= 0; l--) {
            if (collision(_enemies[j], _bullets[l])) {
              killEnemy(j);
              _bullets.splice(l, 1);
              score++;
              if (_enemies.length === 0 && waveBreak) {
                console.log("workshop");
                openWorkshop();
              }
            }
          }
        }
        for (let h = 0; h < _healthStars.length; h++) {
          _healthStars[h].update();
        }
        for (let hh = _healthStars.length - 1; hh >= 0; hh--) {
          for (let hhh = _bullets.length - 1; hhh >= 0; hhh--) {
            if (collision(_healthStars[hh], _bullets[hhh])) {
              _healthStars.splice(hh, 1);
              _bullets.splice(hhh, 1);
              health += 10;
              star_sound.play();
            }
          }
        }
        for (let gg = _gears.length - 1; gg >= 0; gg--) {
          if (collision(__player, _gears[gg])) {
            _gears.splice(gg, 1);
            gears += 1;
            gear_sound.play();
          }
          for (let ggg = _bullets.length - 1; ggg >= 0; ggg--) {
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
