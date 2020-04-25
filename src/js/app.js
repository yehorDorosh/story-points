const lib = (function(){
  return {
    // Get random integer number between min & max, both included
    getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1) ) + min;
    },
    getFibonacciArr(max = 13) {
      let arr, curr;
      arr  = [0, 1];
      curr = 1;
      while (curr < max) {
        let num = curr + arr[arr.length - 2]
        arr.push(num);
        curr = num;
      }
      return arr;
    },

    delay(time, callback) {
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        if (progress < time) {
          window.requestAnimationFrame(step);
        } else {
          callback(progress);
        }
      }
      
      window.requestAnimationFrame(step);
    }
  }
})();

const elems = (function(){
  const DOMstrings = {
    ballBtn: '.ball',
    SPvalue: '.ball__value',
    sliderRow: '.slider__row',
    sliderPoint: '.slider__point'
  }

  function getElements(objNames) {
    let elem = {};
    for (let varName in objNames) {
      let nodeList = document.querySelectorAll(objNames[varName]);
      if (nodeList.length === 0) {
        console.error(`"elem.${varName}" is NULL. No slector "${objNames[varName]}" in DOM`)
      } else if (nodeList.length === 1) {
        elem[varName] = nodeList[0];
      } else {
        elem[varName] = Array.from(nodeList);
      }
    }
    return elem;
  }

  return getElements(DOMstrings);
})();

const app = (function(lib){

  return {
    getRndSP (minSP = 1, maxSP = 13) {
      const fibArr = lib.getFibonacciArr(maxSP).splice(2);
      const index = lib.getRndInteger(fibArr.indexOf(minSP), fibArr.length - 1);
      return fibArr[index];
    },

    shake(minSP, maxSP) {
      elems.ballBtn.classList.add('animate');
      lib.delay(400, () => {
        elems.SPvalue.innerText = this.getRndSP(minSP, maxSP);
        elems.ballBtn.classList.remove('animate');
      });
    }
  }
})(lib);

const slider = (function(elems){
  const activeClassName = 'slider__point--active';
  return {
    getMinMax() {
      let min, max;
  
      for (let elem of elems.sliderPoint) {
        if (elem.classList.contains(activeClassName) && min && !max)
          max = parseInt(elem.innerText);
        if (elem.classList.contains(activeClassName) && !min)
          min = parseInt(elem.innerText);
      }
  
      return [min, max];
    },
    setActiveBtn(target) {
      if (target.classList.contains(activeClassName)) return;
      let targetIndex, min, max, middle;
      targetIndex = elems.sliderPoint.findIndex(elem => elem === target);

      elems.sliderPoint.forEach((elem, i) => {
        if (elem.classList.contains(activeClassName) && !isNaN(min) && isNaN(max))
          max = i;
        if (elem.classList.contains(activeClassName) && isNaN(min))
          min = i;
      });

      middle = ((max - min) / 2) + min;
  
      target.classList.add(activeClassName);

      if (targetIndex < min) {
        elems.sliderPoint[min].classList.remove(activeClassName);
      } else if (targetIndex > max) {
        elems.sliderPoint[max].classList.remove(activeClassName);
      } else if (targetIndex > min && targetIndex < max && targetIndex < middle) {
        elems.sliderPoint[min].classList.remove(activeClassName);
      } else if (targetIndex > min && targetIndex < max && targetIndex >= middle) {
        elems.sliderPoint[max].classList.remove(activeClassName);
      }
    }
  }
})(elems);

const DOMctrl = (function(elems, app, slider) {
  document.addEventListener('click', e => {
    if (e.target === elems.ballBtn || e.target.parentElement === elems.ballBtn) {
     app.shake(...slider.getMinMax());
    }
    if (e.target.classList.contains('slider__point')) {
      slider.setActiveBtn(e.target);
     }
  });
})(elems, app, slider);