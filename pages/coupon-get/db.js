const productionMap = {
  'horizontal': {
    width: 233,
    height: 187,
    url: 'https://vfiles.gtimg.cn/vupload/202006/5cc3961592036096376.png',
    title: 'abcmouse双用小挎包',
    price: 68
  },
  'vertical': {
    width: 493,
    height: 653,
    url: "https://vfiles.gtimg.cn/vupload/202006/958c6c1592036096494.png",
    title: "推荐好礼-一个月免费会员",
    price: 50,
  },
  'custom': {
    url: "https://vfiles.gtimg.cn/vupload/202006/10013f1592038299689.png",
    title: '打折优惠卷200元',
    price: '49.9'
  }
};

export function getCouponById(data) {
  // 获取初始化数据
  return new Promise((resolve, reject) => {
    const defaultData = [
      { 
        id: '1',
        ...productionMap['vertical'],
      },
      { 
        id: '2',
        ...productionMap['horizontal'],
      },
      { 
        id: '3',
        ...productionMap['custom'],
        width: 160,
        height: 128
      },
    ];
    setTimeout(() => {
      resolve(defaultData);
    }, 300);
  });
};

export function addCoupon(id, limit = 10) {
  // 获取新增数据
  return new Promise((resolve, reject) => {
    const result = [];
    for(let index = 0; index < limit; index++) {
      const isValidate = Math.random();
      if (isValidate <= 0.33) {
        result.push({
          id,
          ...productionMap['vertical'],
        });
      } else if (isValidate <= 0.66) {
        result.push({
          id,
          ...productionMap['horizontal'],
        });
      } else {
        const height = 128 * Math.random() * 2;
        result.push({ 
          id,
          width: 166,
          height,
          ...productionMap['custom']
        });
      }
    }
    resolve(result);
  });
}