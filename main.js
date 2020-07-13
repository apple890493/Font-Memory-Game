//設定遊戲狀態,controller會依遊戲狀態來分配動作
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

/***********
 * 資料相關 *
 ***********/
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

/***********
 * 介面相關 *
 ***********/

const view = {
  //生成一張牌的模板
  // displayCards() {
  //   document.querySelector('#cards').innerHTML = `
  //     <div class="card">
  //       <p>6</p>
  //       <img src="https://image.flaticon.com/icons/svg/105/105220.svg">
  //       <p>6</p>
  //     </div>  
  //   `
  // }

  //開始-生成52張牌(DOM)
  getCardContent(index) {
    const number = view.transForNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
      <p>${number}</p>
      <img src="${symbol}"/>
      <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `
      <div data-index="${index}" class="card back"></div>  
    `
  },
  //將數字轉換成英文
  transForNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //Array.from 可以從「類似陣列」的物件來建立陣列,所以使用map來做拿取並建立真正陣列
    //utility取代Array.from(Array(52).keys())
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  },
  //flipCards=(1,2,3,4)
  //cards = [1, 2, 3, 4]
  flipCards(...cards) {
    //背面回傳正面
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))//HTML回傳的是字串,所以要改成數字
        return
      }
      //正面回傳背面
      card.classList.add('back')
      card.innerHTML = null //將內容清空
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried ${times} times`;
  },

  //finished
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <h2>WIN</h2>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


const utility = {
  getRndomNumber(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      //隨機亂數取randomIndex值
      let randomIndex = Math.floor(Math.random() * (index + 1))
        //number陣列[randomIndex]值與number陣列[index]值互換
        ;[number[index], number[randomIndex]] =
          [number[randomIndex], number[index]]
    }
    return number //回傳值
  }
}


/***********
 * 管理資料 *
 ***********/

//宣告model來集中管理資料
const model = {
  //宣告分數及次數起始
  score: 0,
  triedTimes: 0,

  //設置初始資料
  revealedCards: [], //暫存排組,檢視完後需清空

  //檢查兩張配對是否成功
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
}

/***********
 * 任務安排 *
 ***********/

//宣告controller object
const controller = {
  //標記目前遊戲狀態,設定初始狀態FCA,代表還沒翻牌
  currentState: GAME_STATE.FirstCardAwaits,
  basicCards(indexes) {
    view.displayCards(indexes)
  },

  //依照不同遊戲狀態,做不同行為,中樞系統!
  dispatchCardAction(card) {
    //如果沒有背面牌的話就結束
    if (!card.classList.contains('back')) {
      return
    }
    //使用switch()來取代if/else
    switch (this.currentState) {
      //First state
      case GAME_STATE.FirstCardAwaits:
        //正面顯示
        view.flipCards(card)
        //卡片放在暫存牌組裡
        model.revealedCards.push(card)
        //改變遊戲狀態,進入第二張牌狀態
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      //Second state
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //分歧點,檢查兩組數字是否相同
        if (model.isRevealedCardsMatched()) {
          //correct
          // scroe +10 point
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          //顏色改變
          view.pairCards(...model.revealedCards)
          //比對結束清空暫存陣列
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          //回到等待第一張狀態
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //incorrect
          this.currentState = GAME_STATE.CardsMatchFailed
          //讓牌組停留1秒再翻蓋回去,使用setTimeout()
          //裏頭的參數是要呼叫函式本身所以不加(),否則傳入該函式的值
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }

    console.log('current state', this.currentState)
    console.log('revealed card', model.revealedCards)
  },
  //牌組配對失敗後續動作
  resetCards() {
    //翻蓋回去function
    view.flipCards(...model.revealedCards)
    //比對結束清空暫存陣列
    model.revealedCards = []
    //回到等待第一張狀態,若繼續使用this,將會指向setTimeout而不是controller
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.basicCards(utility.getRndomNumber(52))

//Node List (array-like) 所以不能用map()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // view.flipCard(card)
    controller.dispatchCardAction(card)
  })
})

//MVC守則-不要讓 controller 以外的內部函式暴露在 global 的區域。
//程式優化-重構函式-改寫 flipCard & 改寫 pairCard & setTimeOut變成獨立funvtion

//注意coding順序