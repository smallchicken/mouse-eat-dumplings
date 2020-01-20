import bgImg from './assets/images/bg.jpg'
import player from './assets/images/player.png'
import foot1 from './assets/images/food1.png'
import foot2 from './assets/images/food2.png'

class ImageMonitor {
  constructor () {
    this.imgArray = []
  }
  createImage (src) {
    return typeof this.imgArray[src] != 'undefined' ? this.imgArray[src] : (this.imgArray[src] = new Image(), this.imgArray[src].src = src, this.imgArray[src])
  }
  loadImage (arr, callback) {
    for(var i=0,l=arr.length; i<l; i++){
      var img = arr[i];
      this.imgArray[img] = new Image();
      this.imgArray[img].onload = () => {
        if(i==l-1 && typeof callback=='function'){
          callback(this.imgArray[img]);
        }
      }
      this.imgArray[img].src = img
    }
  }
}

class Ship {
  constructor (gameMonitor) {
    gameMonitor.im.loadImage([player])
    this.width = 80
    this.height = 80
    this.left = gameMonitor.width/2 - this.width/2
    this.top = gameMonitor.height - 2*this.height
    this.player = gameMonitor.im.createImage(player)
  }
  paint (ctx) {
    ctx.drawImage(this.player, this.left, this.top, this.width, this.height)
  }
  setPosition (e, ctx) {
    this.left = e.changedTouches[0].clientX - this.width/2
    this.top = e.changedTouches[0].clientY - this.height/2
    if (this.left < 0) {
      this.left = 0
    }
    if (this.left > window.innerWidth - this.width) {
      this.left = window.innerWidth - this.width
    }
    if (this.top < 0) {
      this.top = 0
    }
    if (this.top > window.innerHeight - this.height) {
      this.top = window.innerHeight - this.height
    }
    this.paint(ctx)
  }
  controll (gameMonitor, ctx) {
    let el = document.getElementById("panel")
    let move = false
    el.addEventListener(gameMonitor.eventType.start, (e) => {
      this.setPosition(e, ctx);
      move = true;
    })
    el.addEventListener(gameMonitor.eventType.end, () => {
      move = false
    })
    el.addEventListener(gameMonitor.eventType.move, (e) => {
      e.preventDefault();
			if(move){
				this.setPosition(e, ctx);	
			}
    })
  }
  eat (foodList, gameMonitor) {
    for(let i = foodList.length -1; i >= 0; i--) {
      let f = foodList[i]
      if (f) {
        let T1 = f.top + 10
        let B1 = f.top + (f.height - 10)
        let L1 = f.left
        let R1 = f.left + f.width
        let T2 = this.top + 15
        let B2 = this.top + (this.height - 15)
        let L2 = this.left + 20
        let R2 = this.left + this.width - 15
        if (!(R1 < L2 || B1 < T2 || L1 > R2 || T1 > B2)) {
          foodList[f.id] = null
          if (f.type === 0) {
            // 游戏停止
            gameMonitor.stop();
          } else {
            ++gameMonitor.score
          }
        }
      }
    }
  }
}

class Food {
  constructor (type, left, id, gameMonitor) {
    this.speedUpTime = 300
    this.id = id
    this.type = type
    this.width = 50
    this.height = 50
    this.left = left
    this.top = -50
    this.speed = 0.04 * Math.pow(1.2, Math.floor(gameMonitor.time/this.speedUpTime))
    this.loop = 0;
    let p = this.type == 0 ? foot1 : foot2
    this.pic = gameMonitor.im.createImage(p);
  }
}

Food.prototype.paint = function(ctx){
  ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function(ctx, gameMonitor){
  if(gameMonitor.time % this.speedUpTime == 0){
    this.speed *= 1.2;
  }
  this.top += ++this.loop * this.speed;
  if(this.top>gameMonitor.h){
    gameMonitor.foodList[this.id] = null;
  }
  else{
    this.paint(ctx);
  }
}

export default {
  width: window.innerWidth,
  height: window.innerHeight,
  bgWidth: 320,
  bgHeight: 1126,
  bgSpeed : 2,
	bgloop : 0,
  bgDistance : 0,//背景位置
  im : new ImageMonitor(),
  time : 0,
  foodList: [],
  score : 0,
  timmer: null,
  currentType: 'init',
  eventType : {
		start : 'touchstart',
		move : 'touchmove',
		end : 'touchend'
	},
  init () {
    let canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    canvas.id = 'panel'
    document.body.appendChild(canvas)
    let ctx = canvas.getContext('2d')

    let bg = new Image()
    this.bg = bg
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, this.width, this.bgHeight)

      this.getScore(ctx)

      if (this.currentType === 'init') {
        this.startBtn(ctx)
      } else if (this.currentType === 'end') {
        this.reStart(ctx)
      }
    }
    bg.src = bgImg
  },
  startBtn (ctx) {
    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.fillRect(50, (this.height - 300)/2, this.width - 100, 300)
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = 'yellow'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = "24px Helvetica";
    ctx.fillText('小老鼠吃水饺', this.width/2,  (this.height)/2 - 115)
    ctx.fillStyle = '#333'
    ctx.font = '14px'
    ctx.fillText('', this.width/2,  (this.height)/2 - 100)
    this.drawtext(ctx,'帮助小老鼠吃水饺，但是它会害怕鞭炮，遇到鞭炮请避开哦！', this.width/2, (this.height)/2 - 90, this.width - 120)
    ctx.fillRect((this.width - 120)/2, (this.height - 100)/2 + 100, 120, 40);
    ctx.clearRect((this.width - 117)/2, (this.height - 98)/2 + 100, 117, 38);
    ctx.fillStyle = 'yellow'
    ctx.textBaseline = 'top'
    ctx.fillText('开始游戏', this.width/2,  (this.height - 98)/2 + 105)
    document.getElementById('panel').onclick = (e) => {
      let x = e.pageX
      let y = e.pageY
      if (x > (this.width/2 - 60) && x < (this.width/2 + 60) && y > ((this.height - 98)/2 + 105) && y < ((this.height - 98)/2 + 145)) {
        this.startGame(ctx)
      }
    }
  },
  drawtext(ctx,t,x,y,w){
    //参数说明
    //ctx：canvas的 2d 对象，t：绘制的文字，x,y:文字坐标，w：文字最大宽度
    let chr = t.split("")
    let temp = ""
    let row = []

    for (let a = 0; a<chr.length;a++){
        if( ctx.measureText(temp).width < w && ctx.measureText(temp+(chr[a])).width <= w){
            temp += chr[a];
        }else{
            row.push(temp);
            temp = chr[a];
        }
    }
    row.push(temp)
    for(let b=0;b<row.length;b++){
        ctx.fillText(row[b],x,y+(b+1)*28);//每行字体y坐标间隔20
    }
  },
  startGame (ctx) {
    this.currentType = 'runing'
    document.getElementById('panel').onclick = null
    this.ship = new Ship(this);
    this.ship.paint(ctx);
    this.ship.controll(this, ctx);
    this.run(ctx)
  },
  rollBg (ctx) {
    if (this.bgDistance >= this.bgHeight) {
      this.bgloop = 0
    }
    this.bgDistance = ++this.bgloop * this.bgSpeed
    ctx.drawImage(this.bg, 0, this.bgDistance - this.bgHeight, this.width, this.bgHeight)
    ctx.drawImage(this.bg, 0, this.bgDistance, this.width, this.bgHeight)
  },
  getScore (ctx) {
    ctx.beginPath()
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.font = "24px Helvetica";
    ctx.fillStyle = '#fff'
    ctx.fillText(`得分：${this.score}`, this.width - 105, 32);
    ctx.closePath()
  },
  genorateFood () {
    let genRate = 50
    let random = Math.random()
    if (random * genRate > genRate -1) {
      let left = Math.random() * (this.width - 50)
      let type = Math.floor(left)%2 === 0 ? 0 : 1
      let id = this.foodList.length
      let f = new Food(type, left, id, this)
      this.foodList.push(f)
    }
  },
  stop () {
    this.currentType = 'end'
    document.body.innerHTML = ''
    this.init()
    setTimeout(() => {
      clearTimeout(this.timmer);
		}, 0);
  },
  reStart (ctx) {
    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.fillRect(50, (this.height - 300)/2, this.width - 100, 300)
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = 'yellow'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = "24px Helvetica";
    ctx.fillText('小老鼠吃水饺', this.width/2,  (this.height)/2 - 115)
    ctx.fillStyle = '#333'
    ctx.font = '14px'
    ctx.fillText('', this.width/2,  (this.height)/2 - 100)
    this.drawtext(ctx, `通过您的帮助，小老鼠一共吃到了${this.score}个水饺！`, this.width/2, (this.height)/2 - 90, this.width - 120)
    ctx.fillRect((this.width - 120)/2, (this.height - 100)/2 + 100, 120, 40);
    ctx.clearRect((this.width - 117)/2, (this.height - 98)/2 + 100, 117, 38);
    ctx.fillStyle = 'yellow'
    ctx.textBaseline = 'top'
    ctx.fillText('重新游戏', this.width/2,  (this.height - 98)/2 + 105)
    document.getElementById('panel').onclick = (e) => {
      let x = e.pageX
      let y = e.pageY
      if (x > (this.width/2 - 60) && x < (this.width/2 + 60) && y > ((this.height - 98)/2 + 105) && y < ((this.height - 98)/2 + 145)) {
        this.foodList = [];
        this.bgloop = 0;
        this.score = 0;
        this.timmer = null;
        this.time = 0;
        this.startGame(ctx)
      }
    }
  },
  run (ctx) {
    ctx.drawImage(this.bg, 0, 0, this.width, this.bgHeight)
    this.rollBg(ctx)
    
    this.getScore(ctx)

    this.ship.paint(ctx)
    this.ship.eat(this.foodList, this)

    this.genorateFood()

    for(let i = this.foodList.length - 1; i >= 0; i--) {
      let f = this.foodList[i]
      if (f) {
        f.paint(ctx)
        f.move(ctx, this)
      }
    }

    // this.timmer = requestAnimationFrame(this.run(ctx))
    this.timmer = setTimeout(() => {
			this.run(ctx);
		}, Math.round(1000/60));

    this.time++
  }
}



