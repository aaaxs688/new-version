Vue.use(vant.Dialog)
Vue.use(vant.Notify);
var app = new Vue({
  el: "#app",
  data: {
    message: "Hello Vue!",
    caloriesNumber: [],
    foodList: [],
    setFoodShowConfirm: false,
    foodstuff: {},
    loading: true,
    selectFoodStuff: {},
    setStuffIndex: 0,
    footGram: 0,
    timeNumber: 0,
    option: {
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: 'vertical',  // Legend arranged vertically
        right: '0%',        // Legend on the right
        top: 'center',
        textStyle: {
          fontSize: 30,      // Adjust text size
        },
        itemWidth: 25,       // Adjust legend width
        itemHeight: 14   
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          center:['25%', '50%'],
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "left",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [],
        },
      ],
    },
    chart:''
  },
  created() {
    this.getFoodCalories();
  },
  computed: {
    act(value) {
      return function (value, className) {
        if (value === this.setStuffIndex) {
          return className;
        }
        return "";
      };
    },
    total() {
      return function (item) {
        return (item.formula * this.footGram).toFixed(2);
      };
    },
  },
  watch: {
    footGram: {
      handler(newval, oldval) {
        if (newval > 1000) {
          this.footGram = "1000";
        }
        if (newval[0] == "0") {
          this.footGram = newval.replace(/^0(\d)/, "$1");
        }
        if (newval == "") {
          this.footGram = "0";
          return;
        }
      },
      deep: true,
    },
  },
  methods: {
    delFood (value,j,item) {
      vant.Dialog.confirm({
        title: 'delete',
        message: 'Are you sure to delete it?',
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel'
      })
        .then(() => {
          // on confirm
        this.foodstuff = value;
        this.timeNumber = item.index;
        let { id } = this.foodstuff;
        request.post(
          "/delFoodCalories",
          { id,index:j, timeNumber: this.timeNumber },
          (data) => {
            vant.Notify({ type: 'success', message: 'delete successfully' });
            this.getFoodCalories();
          }
        );
        })
        .catch(() => {
          // on cancel
        });
     
     
    },
    setFoodStuff(item, index) {
      this.selectFoodStuff = item;
      this.setStuffIndex = index;
    },
    setFoodConfirm(value, index, item) {
      this.foodstuff = value;
      this.timeNumber = item.index;
      this.footGram = value.grams;
      this.setFoodShowConfirm = true;
    },
    setFoodCalories() {
      let { id } = this.foodstuff;

      request.post(
        "/setFoodCalories",
        { id, footGram: this.footGram, timeNumber: this.timeNumber },
        (data) => {
          this.setFoodShowConfirm = false;
          vant.Notify({ type: 'success', message: 'modify successfully' });
          this.getFoodCalories();
        }
      );
    },
    initChart() {
      
    },
     calculateTotal () {
      let data = this.foodList
      this.caloriesNumber = []
       data.forEach(item => {
        const total = item.list.reduce((sum, foodItem) => {
          const grams = parseFloat(foodItem.grams);
          const formula = parseFloat(foodItem.foodHeat[0].formula);
          return sum + (grams * formula);
        }, 0);
        this.caloriesNumber.push(total)
        return data
      });
    },
    getFoodCalories() {
      this.loading = true;
      request.get("/getFoodCalories", {}, (data) => {
        this.foodList = JSON.parse(data);
        this.foodList.forEach((item, index) => {
          item.list.forEach((value, list) => {
              this.option.series[0].data.push({
                value: value.grams,
                name: value.foodName
              });
          });
        });
        setTimeout(() => {
          this.loading = false;
          this.calculateTotal()
          let chart = echarts.init(this.$refs.chart);
          chart.setOption(this.option);
        }, 1000);
      });
    },
  },
});

