const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function ElonPromise(fn) {
  this.status = PENDING;
  this.value = null;
  this.reason = null;

  this.fulfillCallback = [];
  this.rejectCallback = [];
  this.finalCallback = [];

  function resolve(value) {
    if (this.status !== PENDING) return;
    this.value = value;
    this.status = FULFILLED;

    while (true) {
      let callback = this.fulfillCallback?.pop();
      if (!callback) break;
      callback.call(this, this.value);
    }

    while (true) {
      let callback = this.finalCallback?.pop();
      if (!callback) break;
      callback.call(this, this.value, this.reason);
    }
  }

  function reject(reason) {
    if (this.status !== PENDING) return;
    this.reason = reason;
    this.status = REJECTED;

    while (true) {
      let callback = this.rejectCallback?.pop();
      if (!callback) break;
      callback.call(this, this.reason);
    }

    while (true) {
      let callback = this.finalCallback?.pop();
      if (!callback) break;
      callback.call(this, this.value, this.reason);
    }
  }

  try {
    fn(resolve.bind(this), reject.bind(this));
  } catch (err) {
    reject(err);
  }
}

ElonPromise.prototype.finally = function (onFinal) {
  if (this.status === PENDING) {
    typeof onFinal == 'function' && this.finalCallback.push(onFinal);
  } else {
    typeof onFinal == 'function' && onFinal(this.reason, this.value);
  }
  return this;
};

ElonPromise.prototype.catch = function (onRejected) {
  if (this.status === PENDING) {
    typeof onRejected == 'function' && this.rejectCallback.push(onRejected);
  } else if (this.status === REJECTED) {
    typeof onRejected == 'function' && onRejected(this.reason);
  }
  return this;
};

ElonPromise.resolve = function (value) {
  return new ElonPromise((resolve) => {
    resolve(value);
  });
};

ElonPromise.reject = function (reason) {
  return new ElonPromise((resolve, reject) => {
    reject(reason);
  });
};

ElonPromise.prototype.then = function (onFulfill, onReject) {
  switch (this.status) {
    case FULFILLED:
      return new ElonPromise((resolve, reject) => {
        if (typeof onFulfill === 'function') {
          const result = onFulfill(this.value);

          if (result instanceof ElonPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } else {
          resolve(this.value);
        }
      });
    case REJECTED:
      return new ElonPromise((resolve, reject) => {
        if (typeof onReject === 'function') {
          onReject(this.reason);
        }
        reject(this.reason);
      });
    case PENDING:
      return new Promise((resolve, reject) => {
        this.fulfillCallback.push((value) => {
          if (typeof onFulfill === 'function') {
            const result = onFulfill(value);
            if (result instanceof ElonPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } else {
            resolve(value);
          }
        });

        this.rejectCallback.push((reason) => {
          if (typeof onReject === 'function') {
            onReject(this.reason);
          }
          reject(this.reason);
        });
      });
  }
};

// 原型方法
new ElonPromise((resolve, reject) => {
  //   setTimeout(() => resolve(123), 1200);
  setTimeout(() => reject('error'), 1200);
})
  .then((val) => {
    console.log({ val });
    // return ElonPromise.reject('err');
  })
  .catch((err) => console.log({ err }));
// TODO 需要再思考链式调用时， 最后 finally 是获取什么
//   .finally((val, err) => console.log({ val, err }));

// 静态方法
// ElonPromise.resolve(101).then((val) => console.log({ val }));
// ElonPromise.reject('error').catch((err) => console.log({ err }));

// 链式调用
// const times2 = (val) =>
//   new ElonPromise((resolve, reject) => {
//     const result = val * 2;

//     setTimeout(() => {
//       resolve(result);
//       console.log(`${val} -> ${result}`);
//     }, 1000);
//   });

// new ElonPromise((resolve) => {
//   setTimeout(() => resolve(2000), 2000);
// })
//   .then(times2)
//   .then(times2)
//   .then(times2)
//   .catch((err) => console.log({ err }));
