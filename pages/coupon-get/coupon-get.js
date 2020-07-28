// miniprogram/pages/coupon/coupon.js
import { getCouponById, addCoupon } from './db';
// import { setGlobalData, getGlobalData } from '@tencent/abcmouse-sdk-mp-tools';

function computeRatioHeight (data) {
  // 计算当前元素相对于屏幕宽度的百分比的高度
  // 移动短
  const screenWidth = 375; // 设计稿的屏幕宽度
  const itemHeight = data.height; //设计稿中的元素高度，也可以前端根据类型约定
  return Math.ceil(screenWidth / itemHeight * 100);
}

function formatData(data) {
  let diff = 0;
  const left = [];
  const right = [];
  let i = 0;
  while(i < data.length) {
    if (diff <= 0) {
      left.push(data[i]);
      diff += computeRatioHeight(data[i]);
    } else {
      right.push(data[i]);
      diff -= computeRatioHeight(data[i]);
    }
    i++;
  }
  return { left, right }
}

function getImgInfo(url) {
  return new Promise((resolve, reject) => {
    // 创建对象
    const img = new Image();
    // 改变图片的src
    img.src = img_url;
    // 判断是否有缓存
    if (img.complete) {
      resolve({ width: img.width, height: img.height });
    } else {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
    }
  });
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [], // 初始数据
    left: [], // 左侧历史
    right: [], // 右侧历史
    diffValue: 0, // 左右列容器的高度差
    addValue: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const userInfo = getGlobalData('userInfo');
    // const phone = getGlobalData('phone');
    const phone = '123345';

    if (phone) {
      // 通过手机号获取优惠卷
      getCouponById(phone).then(res => {
        this.setData({
          couponList: res || [],
        }, () => {
          this.resetLayoutByDp(res);
        });
      }).catch(() => {
        wx.showModal({
          title: "网络异常，请刷新重试！",
          content: "请检查下你的网络，",
          complete: () => {
            // 开启重试
          }
        })
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 在这里
    // this.getNewCoupon();
  },
  /**
   * 监听用户下拉刷新事件。
   */
  onPullDownRefresh: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onAddValue: function (e) {
    this.setData({
      addValue: e.detail.value
    });
  },
  getNewCoupon: function () {
    addCoupon(this.addValue, 10).then((data) => {
      const { couponList } = this.data;
      this.setData({ couponList: [...data, ...couponList] }, () => {
        this.resetLayoutByDp(data);
      });
      wx.showToast({
        title: "随机商品添加成功",
        icon: 'success',
        mask: true,
        complete: () => { this.setData({ addValue: '' }) }
      })
    }).catch((res) => {
      if (typeof res === 'string') {
        wx.showToast({
          title: res,
          icon: 'none',
          mask: true,
        })
      } else {
        console.log(res);
        wx.showToast({
          title: '网络失败请重试',
          icon: 'none',
          mask: true,
        })
      }
    });
  },

  resetLayoutByDp: function (couponList) {
    const { left, right, diffValue } = this.data;
    const heights = couponList.map(item => (item.height / item.width * 160 + 77));
    const bagVolume = Math.round(heights.reduce((sum, curr) => sum + curr, diffValue) / 2);
    let dp = []
    // 基础状态 只考虑第一个图片的情况
    dp[0] = []
    for (let cap = 0; cap <= bagVolume; cap++) {
      dp[0].push(heights[0] > cap ? { max: 0, indexes: [] } : { max: heights[0], indexes: [0] }); 
    }
    for (
      let useHeightIndex = 1;
      useHeightIndex < heights.length;
      useHeightIndex++
    ) {  
      if (!dp[useHeightIndex]) {
        dp[useHeightIndex] = []
      }
      for (let cap = 0; cap <= bagVolume; cap++) {
        let usePrevHeightDp = dp[useHeightIndex - 1][cap]
        let usePrevHeightMax = usePrevHeightDp.max
        let currentHeight = heights[useHeightIndex]
        // 这里有个小坑 剩余高度一定要转化为整数 否则去dp数组里取到的就是undefined了
        let useThisHeightRestCap = Math.round(cap - heights[useHeightIndex])
        let useThisHeightPrevDp = dp[useHeightIndex - 1][useThisHeightRestCap]
        let useThisHeightMax = useThisHeightPrevDp
          ? currentHeight + useThisHeightPrevDp.max
          : 0

        // 是否把当前图片纳入选择 如果取当前的图片大于不取当前图片的高度
        if (useThisHeightMax > usePrevHeightMax) {
          dp[useHeightIndex][cap] = {
            max: useThisHeightMax,
            indexes: useThisHeightPrevDp.indexes.concat(useHeightIndex),
          }
        } else {
          dp[useHeightIndex][cap] = {
            max: usePrevHeightMax,
            indexes: usePrevHeightDp.indexes,
          }
        }
      }
    }
    const rightIndex = dp[heights.length - 1][bagVolume].indexes;
    const nextDiff = heights.reduce((target, curr, index) => {
      if (rightIndex.indexOf(index) === -1) {
        target += heights[index];
      } else {
        target -= heights[index];
      }
      return target;
    }, 0);
    const rightData = rightIndex.map(item => couponList[item]);
    const leftData = couponList.reduce((target, curr, index) => {
      if (rightIndex.indexOf(index) === -1) {
        target.push(couponList[index]);
      }
      return target;
    }, []);
    this.setData({ 
      left: [...left, ...leftData],
      right: [...right, ...rightData],
      diffValue: diffValue + nextDiff,
    }, () => {
      // 更新左右间距差
      const query = wx.createSelectorQuery();
      query.select('#left-archer').boundingClientRect();
      query.select('#right-archer').boundingClientRect();
      const { diffValue } = this.data;
      query.exec((res) => {
        console.log(res[0].top - res[1].top, diffValue);
        this.setData({
          diffValue: res[0].top - res[1].top,
        });
      });
    });
  }
})