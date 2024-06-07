
// Load the vant components
Vue.use(vant.Dialog);
Vue.use(vant.Notify);
// vue writing
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
    unitList: ['g', 'Amount'], // unit
    unitIndex: 0,
    unitItem: {},
    option: {  // echarts configuration
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical", // Legend arranged vertically
        right: "10%", //Legend on the right
        top: "center",
        textStyle: {
          fontSize: 16, // Adjust text size
        },
        itemWidth: 25, //Adjust legend width
        itemHeight: 14,
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          center: ["27%", "50%"],
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "left",
          },
          // emphasis: {
          //   label: {
          //     show: true,
          //     fontSize: 40,
          //     fontWeight: "bold",
          //   },
          // },  //Delete font display
          labelLine: {
            show: false,
          },
          data: [],
        },
      ],
    },
    resetFood: {},
    chart: null
  },
  created() { //  lifecycle and triggered as soon as the page enters
    this.getFoodCalories();
  },
  computed: { // compute function
    amountTotal () { // calculate Calories in amount
      return function (item) {
        return (item.amountFormula * this.footGram).toFixed(2);
      };
    },
    total() { // calculate Calories in g
      return function (item) {
        return (item.formula * this.footGram).toFixed(2);
      };
    },
  },
  mounted () {
    // this.renderChart()
    // add eventListener Reload the chart when the page DOM changes
    console.log(window.addEventListener)
  },
  beforeDestroy () {
    /* remove eventListener，echarts */
    window.removeEventListener(this.$refs.chart, this.resizeD())
    this.chart.dispose()
    this.chart = null
  },
  watch: {
    footGram: { // Monitor g changes
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
    rowFontsize () {
      this.option.legend.textStyle.fontSize = 16; // Adjust font size according to rem
      this.chart.setOption(this.option); // Update chart
      if (this.chart) {
        this.chart.resize();
      }
    },
    renderChart () {
      this.chart = echarts.init(this.$refs.chart);
      this.chart.setOption(this.option);
      window.addEventListener(this.$refs.chart, this.resizeD())
    },
    resizeD (val) {
      let that = this
      window.onresize = function () {
        console.log('resize')
        that.rowFontsize()
        // that.chart.resize()
      }
    },
    setUnitIndex (item, index) { // Set unit change
      this.foodstuff.unit = index
      // this.foodstuff = item
    },
    delFood(value, j, item) { //delete, vant's dialog popup is used, and can do confirm and cancel events  .then is 'confirm'  .catch is 'cancel'
      vant.Dialog.confirm({
        title: "delete",
        message: "Are you sure to delete it?",
        confirmButtonText: "confirm",
        cancelButtonText: "cancel",
      })
        .then(() => {
          // on confirm 
          this.foodstuff = value;
          this.timeNumber = item.index;
          let { id } = this.foodstuff;
          request.post(
            "/delFoodCalories",
            { id, index: j, timeNumber: this.timeNumber },
            (data) => {
              vant.Notify({ type: "success", message: "delete successfully" });
              this.getFoodCalories();
            }
          );
        })
        .catch(() => {
          // on cancel
        });
    },
    resetUnit () { // Get the home page data again
      this.getFoodCalories()
    },
    // setFoodStuff(item, index) { // Get clickable food data
    //   this.selectFoodStuff = item;
    //   this.setStuffIndex = index;
    // },
    setFoodConfirm(value, index, item) { // Open popup window to get data
      this.resetFood = value;
      this.foodstuff = value;
      this.timeNumber = item.index;
      this.footGram = value.grams;
      this.setFoodShowConfirm = true;
    },
    setFoodCalories() { // Click done, modify dat, post request
      let { id, unit } = this.foodstuff;
      request.post( 
        "/setFoodCalories",
        { id, footGram: this.footGram, timeNumber: this.timeNumber, unit },
        (data) => {
          this.setFoodShowConfirm = false;
          vant.Notify({ type: "success", message: "modify successfully" });
          this.getFoodCalories();
        }
      );
    },
    calculateTotal() { //  Count the total calories for each session
      let data = this.foodList;
      this.caloriesNumber = [];
      data.forEach((item) => {
        const total = item.list.reduce((sum, foodItem) => {
          const grams = parseFloat(foodItem.grams);
          const formula = parseFloat(foodItem.foodHeat[0].formula);
          const amountFormula = parseFloat(foodItem.foodHeat[0].amountFormula)
          if (foodItem.unit == 0) {
            return sum + grams * formula;
          } else if (foodItem.unit == 1) {
            return sum + grams * amountFormula;
          }
        }, 0);
        this.caloriesNumber.push(total);
        return data;
      });
    },
    getFoodCalories() { // get food data
      this.loading = true;
      this.option.series[0].data = [];
      request.get("/getFoodCalories", {}, (data) => {
        this.foodList = JSON.parse(data);

        const result = {};

        // Go through each time period
        this.foodList.forEach((period) => {
          // Go through each food item
          period.list.forEach((item) => {
            const grams = parseFloat(item.grams);
            // Walk through each foodHeat item
            item.foodHeat.forEach((heat) => {
              const name = heat.name;
              const formula = parseFloat(heat.formula);
              const amountFormula = parseFloat(heat.amountFormula)
              // Compute product
              let product
              if (item.unit == 0) {
               product = grams * formula;
              } else if (item.unit == 1) {
               product = grams * amountFormula;
              }
              // Add the result to the corresponding name
              if (!result[name]) {
                result[name] = 0;
              }
              result[name] += product;
            });
          });
        });

        // Iterate over the accumulated result object, converting it to the desired format
        for (const key in result) {
          this.option.series[0].data.push({
            name: key,
            value: result[key].toFixed(2), // Keep two decimal places
          });
        }


        setTimeout(() => { // setTimeout Asynchronous recalculation and drawing
          this.loading = false;
          this.calculateTotal();
          this.renderChart()
        }, 1000);
      });
    },
  },
});
