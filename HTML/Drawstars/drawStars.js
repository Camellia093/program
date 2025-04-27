function drawStars() {
  // 定义数组，arr存放每个小星星的信息，colours为颜色数组
  const arr = [];
  const colours = ["#ffff00", "#66ffff", "#3399ff", "#99ff00", "#ff9900"];

  // 创建画布
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // 让画布自适应窗口大小
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  // 给画布CSS样式，固定定位，且阻止用户的鼠标事件
  canvas.style.cssText = `
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  `;

  // 封装绘制五角星函数
  function star(x, y, r, l, rot) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        Math.cos(((18 + i * 72 - rot) * Math.PI) / 180) * r + x,
        -Math.sin(((18 + i * 72 - rot) * Math.PI) / 180) * r + y
      );
      ctx.lineTo(
        Math.cos(((54 + i * 72 - rot) * Math.PI) / 180) * l + x,
        -Math.sin(((54 + i * 72 - rot) * Math.PI) / 180) * l + y
      );
    }
    ctx.closePath();
  }

  // 绘制星星
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < arr.length; i++) {
      const temp = arr[i];
      star(temp.x, temp.y, temp.r, temp.r * 3, temp.rot);
      ctx.fillStyle = temp.color;
      ctx.strokeStyle = temp.color;
      ctx.lineWidth = 0.2;
      ctx.lineJoin = "round";
      ctx.fill();
      ctx.stroke();
    }
  }

  // 更新动画
  function update() {
    for (let i = 0; i < arr.length; i++) {
      arr[i].x += arr[i].dx;
      arr[i].y += arr[i].dy;
      arr[i].rot += arr[i].td;
      arr[i].r -= 0.015;
      if (arr[i].r < 0) {
        arr.splice(i, 1);
      }
    }
  }

  // 添加星星数据
  function addStars(e) {
    arr.push({
      x: e.clientX,
      y: e.clientY,
      r: Math.random() * 0.5 + 1.5,
      td: Math.random() * 4 - 2,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 1 + 1,
      rot: Math.random() * 90 + 90,
      color: colours[Math.floor(Math.random() * colours.length)],
    });
  }

  // 动画循环
  function animate() {
    draw();
    update();
    requestAnimationFrame(animate);
  }

  // 监听屏幕变化事件
  window.onresize = resizeCanvas;

  // 监听鼠标移动事件
  window.addEventListener("mousemove", addStars);

  // 启动动画
  animate();
}


// 调用函数开始绘制星星
drawStars();