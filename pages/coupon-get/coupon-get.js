// miniprogram/pages/coupon/coupon.js
import { getCouponById, addCoupon } from './db';
// import { setGlobalData, getGlobalData } from '@tencent/abcmouse-sdk-mp-tools';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
    left: [],
    right: [],
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
          this.resetLayoutByDp();
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
    addCoupon(this.addValue).then((data) => {
      const { couponList } = this.data;
      this.setData({ couponList: [data, ...couponList] }, () => {
        this.resetLayoutByDp();
      });
      wx.showToast({
        title: "优惠卷添加成功",
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

  resetLayoutByDp: function () {
    const { couponList } = this.data;
    const heights = couponList.map(item => item.height / item.width * 160 + 77);
    const bagVolume = Math.round(heights.reduce((sum, curr) => sum + curr, 0) / 2);
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
    const left = dp[heights.length - 1][bagVolume].indexes;
    this.setData({ 
      left, 
      right: heights.reduce((target, curr, index) => {
        if (left.indexOf(index) === -1) {
          target.push(index);
        }
        return target;
      }, []) 
    });
  }
})