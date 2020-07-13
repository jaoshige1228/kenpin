$(function(){
  'use strict';

  // 処理に必要な変数たち
  let test = '';
  let index = 0;
  let nextShow = '';
  let buttonText = 'カウント終了';
  let count = 0;
  let decidedBorad;
  let sku_1;
  let sku_2;
  let nowBoardsNumber = 0;
  let checkList;
  let wage = 1250;
  let preWage;
  // ゲームの正解群
  let P_count;
  let P_board;
  let P_sku_1;
  let P_sku_2;
  // 看板たち
  const boardsOrigin = [
    'peropero',
    'dededet',
    'UNCHIRI',
    'TheyFashion',
    'Unlucky_cats',
    'suneoStyle',
    'taiku2ichiba',
    'tomodaoresan6',
    'hwawawawaaa',
    'criticalelf'
  ];
  // 看板をシャッフル
  let boards = shuffle([...boardsOrigin]);
  // 看板を初期化
  resetBoard(nowBoardsNumber);
  // 時給の表示
  $('.hourlyWage').text(wage);


  // スタートをクリックすると、スタート画面を隠し、ゲーム画面を表示
  $(document).on('click', '#startButton', function(){
    // 検品内容を自動設定
    checkList = setCheckList();
    P_count = checkList.count;
    P_board = checkList.board;
    P_sku_1 = checkList.sku_1;
    P_sku_2 = checkList.sku_2;
    // 設定した内容をhtmlに反映
    showCheckList();

    $('#startScreen').removeClass('gameStart');
    $('#gameScreen').addClass('gameStart');
    $('.next').text('カウント終了');
    // カウントしろ！の命令表示
    direction('カウントせよ！');
  });

  // タイトルをクリックするとタイトル画面へ。ついでにbodyのクラスを外す。インデックスも戻す
  $(document).on('click', '#endButton', function(){
    $('body').removeClass('test');
    $('#resultScreen').removeClass('gameStart');
    $('#startScreen').addClass('gameStart');
    index = 0;
    $('.mainWrap').eq(index).addClass('nowShow');
    // カウントをリセット
    count = 0;
    nowBoardsNumber = 0;
    // 結果画面の表示リセット
    $('#resultScreen').find('.nowShow').removeClass('nowShow');
    // 看板を再びシャッフル
    boards = shuffle([...boardsOrigin]);
    // 看板の初期化
    resetBoard(nowBoardsNumber);
  });

  // 現在nowShowがついてる番号を表示
  // 0……カウント画面
  // 1……看板選択画面
  // 2……看板記入画面

  // 次へボタンを押すと次の画面を表示させる
  $(document).on('click', '.next', function(){
    $('.mainWrap').eq(index).removeClass('nowShow');
    $('.mainWrap').eq(index + 1).addClass('nowShow');
    index++;

    // ゲームの段階に応じてボタンのテキストを変化させる
    // また、操作の記録を保持する
    switch(index){
      case 0:
        buttonText = 'カウント終了';
        break;
      case 1:
        buttonText = '看板決定';
        direction('看板を選べ！');
        break;
      case 2:
        buttonText = '検品終了';
        direction('看板を書け！');
        boardDecide();
        break;
      case 3:
        skuDecide();
        break;
    }

    // 最後のゲームなら、結果画面に遷移
    if((index - 1) == 2){
      $('.mainWrap').removeClass('nowShow');
      $('#gameScreen').removeClass('gameStart');
      $('#resultScreen').addClass('gameStart');
      $('body').addClass('test');
      showResult();
      // ゲームをクリアできたかどうか判定
      judgeResult();
    }

    $('.next').text(buttonText);
  });

  // 左にスライドする処理
  $(document).on('click', '#left', function(){
    // 現在の看板を左に流す
    $('.signBoardList:not(.standBy)').addClass('leftSlide');

    $('.signBoardList:not(.standBy)').delay(100).queue(function(){
      // 左に流された看板を一時的に非表示にする
      $(this).addClass('tempStandBy').dequeue();
      // 看板の文字を変更
      changeBoard('left');
    });

    
    // スタンバイ状態の看板を右側にセットし、スタンバイを解除
    $('.signBoardList.standBy').addClass('rightSlide');
    $('.signBoardList').removeClass('standBy');
    
    $('.signBoardList.rightSlide').delay(200).queue(function(){
      // 右側の看板を通常の位置に戻す
      $('.signBoardList').removeClass('rightSlide'); 
      // 左に流した看板をスタンバイ状態にする
      $('.signBoardList.leftSlide').addClass('standBy');
      // 左にセットされている状態を解除
      $('.signBoardList').removeClass('leftSlide');
      // 一時的な非表示を解除
      $('.signBoardList').removeClass('tempStandBy').dequeue();
    });
  });

  // 右にスライドする処理
  $(document).on('click', '#right', function(){
    // 現在の看板を右に流す
    $('.signBoardList:not(.standBy)').addClass('rightSlide');

    $('.signBoardList:not(.standBy)').delay(100).queue(function(){
      // 右に流された看板を一時的に非表示にする
      $(this).addClass('tempStandBy').dequeue();
      // 看板の文字を変更
      changeBoard('right');
    });


    // スタンバイ状態の看板を左側にセットし、スタンバイを解除
    $('.signBoardList.standBy').addClass('leftSlide');
    $('.signBoardList').removeClass('standBy');
    
    $('.signBoardList.leftSlide').delay(100).queue(function(){
      // 左側の看板を通常の位置に戻す
      $('.signBoardList').removeClass('leftSlide'); 
      // 右に流した看板をスタンバイ状態にする
      $('.signBoardList.rightSlide').addClass('standBy');
      // 右にセットされている状態を解除
      $('.signBoardList').removeClass('rightSlide');
      // 一時的な非表示を解除
      $('.signBoardList').removeClass('tempStandBy').dequeue();
    });
  });

  // カウント処理
  $(document).on('click', '.countButton', function(){
    count++;
    $('.testCount').text(count);
  });

  // ルール説明表示
  $(document).on('click', '#expButton', function(){
    $('.explanation').removeClass('exp_hidden');
  });
  let expIndex;
  $(document).on('click', '.expNext', function(){
    expIndex = $('.nowShow').index('.exp');
    if(expIndex == 2){
      $('.explanation').addClass('exp_hidden');
      $('.exp').eq(expIndex).removeClass('nowShow');
      $('.exp').eq(0).addClass('nowShow');
    }else{
      $('.exp').eq(expIndex).removeClass('nowShow');
      $('.exp').eq(expIndex + 1).addClass('nowShow');
      expIndex++;
    }
  });



  // 命令表示関数
  function direction(command){
    let props = {fontSize:"40px",opacity:"1",top:"150px"};
    $('.direction').css(props);
    $('.direction').text(command);
    $('.direction').animate({
      fontSize: 48,
      top: 130,
      opacity: 0
    }, 600);
  }

  // 看板決定処理
  function boardDecide(){
    // 選択した看板名を取得
    decidedBorad = $('.signBoardWrap').children('.signBoardList:not(.standBy)').children('.boardContent_1').html();
    // 選択した看板を次の画面にセット
    $('.signBoardWrap_input').children('.signBoardList_input').children('.boardContent_1').html(decidedBorad);
  }
  // 看板記入処理
  function skuDecide(){
    sku_1 = $('#board_input_1').val();
    sku_2 = $('#board_input_2').val();
    // 記入した内容をリセット
    $('#board_input_1').val('');
    $('#board_input_2').val('');
  }

  // 結果をコンソールに表示
  function showResult(){
    console.log(count);
    console.log(decidedBorad);
    console.log(sku_1);
    console.log(sku_2);
  }

  // ゲームをクリアできたかどうか判定
  function judgeResult(){
    let missReason;

    // 失敗の場合、失敗した理由を保持
    if(P_count != count){
      missReason = 'カウントミス';
    }else if(P_board != decidedBorad){
      missReason = '看板選択ミス';
    }else if(P_sku_1 != sku_1 || P_sku_2 != sku_2){
      missReason = '看板記入ミス';
    }

    // 結果画面のhtml表示を分岐させる
    const result = $('#resultScreen');
    if(missReason){
      result.children('h1').text('検品失敗……');
      result.children('.failed').addClass('nowShow');
      result.find('.speachBubble').text('君、クビね');
      result.find('.missReason').text(missReason);
    }else{
      preWage = wage;
      wage += 50;
      $('.preWage').text(preWage);
      $('.newWage').text(wage);
      $('.hourlyWage').text(wage);
      result.children('h1').text('検品成功！');
      result.children('.success').addClass('nowShow');
      result.find('.speachBubble').text('よくやった！');
    }
  }

  // 看板の初期化
  function resetBoard(number){
    $('.signBoardList:not(.standBy)').children('.boardContent_1').text(boards[number]);
  }

  // 看板の変更
  function changeBoard(rl){
    if(rl == 'left'){
      nowBoardsNumber--;
      if(nowBoardsNumber < 0){
        nowBoardsNumber = (boards.length - 1);
      }
    }else{
      nowBoardsNumber++;
      if(nowBoardsNumber > (boards.length - 1)){
        nowBoardsNumber = 0;
      }
    }
    resetBoard(nowBoardsNumber);
  }

  // シャッフル処理
  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
  }

  // 検品内容を自動設定
  function setCheckList(){
    const res = new Object();
    res.count = Math.floor(Math.random() * (30 - 11) + 11);
    let i = Math.floor(Math.random() * boardsOrigin.length);
    res.board = boardsOrigin[i];
    // skuを生成する
    res.sku_1 = createSku_1();
    res.sku_2 = createSku_2();
    return res;
  }

  function createSku_1(){
    let res = '1';
    let temp = Math.floor(Math.random() * 3);
    res = res + temp;
    for(let i = 0; i < 5; i++){
      temp = Math.floor(Math.random() * 10);
      res = res + temp;
    }
    return res;
  }
  function createSku_2(){
    let res = '0';
    let temp = Math.floor(Math.random() * (10 - 1) + 1);
    res = res + temp;
    return res;
  }

  // 検品詳細をhtmlに埋め込む
  function showCheckList(){
    $('.qty').text(P_count);
    $('.sellerId').text(P_board);
    $('.sku1').text(P_sku_1);
    $('.sku2').text(P_sku_2);
  }
});