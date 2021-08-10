// 原型方法
new ElonPromise((resolve, reject) => {
  //   setTimeout(() => resolve(123), 1200);
  setTimeout(() => reject('error'), 1200);
})
  .then((val) => {
    console.log({ val });
    // return ElonPromise.reject('err');
  })
  .catch((err) => console.log({ err }))
  // TODO 需要再思考链式调用时， 最后 finally 是获取什么
  .finally((val, err) => console.log({ val, err }));

// 静态方法
ElonPromise.resolve(101).then((val) => console.log({ val }));
ElonPromise.reject('error').catch((err) => console.log({ err }));

// 链式调用
const times2 = (val) =>
  new ElonPromise((resolve, reject) => {
    const result = val * 2;

    setTimeout(() => {
      resolve(result);
      console.log(`${val} -> ${result}`);
    }, 1000);
  });

new ElonPromise((resolve) => {
  setTimeout(() => resolve(2000), 2000);
})
  .then(times2)
  .then(times2)
  .then(times2)
  .catch((err) => console.log({ err }));
