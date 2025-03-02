// A simple engine which spreads work out across the JS event loop efficiently

useTests("Wizard", () => {
  let TICK_TIME = (1000 / 60) * 0.9; // Default 60Hz timing with slight reduction

  // Detect refresh rate properly
  if (window.matchMedia) {
    const query = window.matchMedia("(min-refresh-rate: 120Hz)");
    if (query.matches) {
      TICK_TIME = (1000 / 120) * 0.7;
    }
  }

  class Wizard {
    constructor() {
      this.spells = [];
      this.isCasting = false;
    }

    Cast(...spells) {
      this.spells.push(...spells);
      if (this.isCasting) return;

      this.isCasting = true;

      const castChunk = async () => {
        const start = performance.now();

        while (performance.now() - start < TICK_TIME && this.spells.length) {
          const spell = this.spells.shift();
          await spell();
        }

        if (this.spells.length) requestAnimationFrame(castChunk);
        else this.isCasting = false;
      };

      requestAnimationFrame(castChunk);
    }
  }

  /*
  
  think about a brand new type of system that could potentially run in a distributed fashion like over a network, where certain things can be run by a server and certain things by a client. What does a program look like in that context?
  
  */

  // run this manually
  it("spreads tasks out accross the event loop", () => {
    const w = new Wizard();
    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    // document.body.append(canvas);
    // canvas.addEventListener("click", () => {
    //   for (let i = 0; i < 20000; i++) w.Cast(() => console.log("Cast!"));
    // });
  });
});
