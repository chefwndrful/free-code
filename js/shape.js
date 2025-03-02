/*
TODO:
this code uses an old format for inline field tests:

    $getjson: () => JSON.stringify({ x: .x, y: _.y }),
    $testjson: [
      "default JSON",
      () => assert(_.json === '{"x":0,"y":0}'),

      "integer coordinates",
      () => {
        .x = 1;
        .y = 2;
        assert(.json === '{"x":1,"y":2}');
      },

      "float coordinates",
      () => {
        .x = -3.14;
        .y = 2.718;
        assert(.json === '{"x":-3.14,"y":2.718}');
      },

      "special values",
      () => {
        .x = Infinity;
        .y = NaN;
        assert(.json === '{"x":null,"y":null}');
      },
    ],

they need to be converted to:

$testjson: () => {
  it("default JSON", () => {
    assert(.json === '{"x":0,"y":0}');
  });

  it("integer coordinates", () => {
    .x = 1;
    .y = 2;
    assert(.json === '{"x":1,"y":2}');
  });
};

lol tried to have an AI do this and it fumbled around for like 15 mins until I gave up

*/

window.Point = Type("Point", (_) => ({
  x: 0,
  $test_x: [
    (_) => assert(_.x === 0, "default value is 0"),

    "positive integer",
    (_) => {
      _.x = 5;
      assert(_.x === 5);
    },

    "negative integer",
    (_) => {
      _.x = -3;
      assert(_.x === -3);
    },

    "positive float",
    (_) => {
      _.x = 3.14;
      assert(_.x === 3.14);
    },

    "negative float",
    (_) => {
      _.x = -0.001;
      assert(_.x === -0.001);
    },

    "infinity",
    (_) => {
      _.x = Infinity;
      assert(_.x === Infinity);
    },

    "negative infinity",
    (_) => {
      _.x = -Infinity;
      assert(_.x === -Infinity);
    },

    "NaN",
    (_) => {
      _.x = NaN;
      assert(isNaN(_.x));
    },
  ],

  y: 0,
  $test_y: [
    (_) => assert(_.y === 0, "default value is 0"),

    "positive integer",
    (_) => {
      _.y = 10;
      assert(_.y === 10);
    },

    "negative integer",
    (_) => {
      _.y = -7;
      assert(_.y === -7);
    },

    "positive float",
    (_) => {
      _.y = 2.718;
      assert(_.y === 2.718);
    },

    "negative float",
    (_) => {
      _.y = -0.5;
      assert(_.y === -0.5);
    },

    "infinity",
    (_) => {
      _.y = Infinity;
      assert(_.y === Infinity);
    },

    "negative infinity",
    (_) => {
      _.y = -Infinity;
      assert(_.y === -Infinity);
    },

    "NaN",
    (_) => {
      _.y = NaN;
      assert(isNaN(_.y));
    },
  ],

  $get_magnitude: () => Math.sqrt(_.x ** 2 + _.y ** 2),
  $test_magnitude: [
    (_) => assert(_.magnitude === 0, "default magnitude is 0"),

    "positive coordinates",
    (_) => {
      _.x = 3;
      _.y = 4;
      assert(_.magnitude === 5);
    },

    "negative coordinates",
    (_) => {
      _.x = -3;
      _.y = -4;
      assert(_.magnitude === 5);
    },

    "mixed coordinates",
    (_) => {
      _.x = 1;
      _.y = -1;
      assert(_.magnitude === Math.sqrt(2));
    },

    "infinite x",
    (_) => {
      _.x = Infinity;
      _.y = 0;
      assert(_.magnitude === Infinity);
    },

    "infinite y",
    (_) => {
      _.x = 0;
      _.y = Infinity;
      assert(_.magnitude === Infinity);
    },

    "NaN coordinate",
    (_) => {
      _.x = NaN;
      _.y = 1;
      assert(isNaN(_.magnitude));
    },
  ],

  $get_json: () => JSON.stringify({ x: _.x, y: _.y }),
  $test_json: [
    "default JSON",
    (_) => assert(_.json === '{"x":0,"y":0}'),

    "integer coordinates",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(_.json === '{"x":1,"y":2}');
    },

    "float coordinates",
    (_) => {
      _.x = -3.14;
      _.y = 2.718;
      assert(_.json === '{"x":-3.14,"y":2.718}');
    },

    "special values",
    (_) => {
      _.x = Infinity;
      _.y = NaN;
      assert(_.json === '{"x":null,"y":null}');
    },
  ],

  $get_normalized: () => useRoot(() => _.Clone().Normalize()),
  $test_normalized: [
    "zero vector remains zero",
    (_) => assert(_.normalized.x === 0 && _.normalized.y === 0),

    "3-4-5 triangle normalized",
    (_) => {
      _.x = 3;
      _.y = 4;
      assert(
        Math.abs(_.normalized.x - 0.6) < 1e-10 &&
          Math.abs(_.normalized.y - 0.8) < 1e-10
      );
    },

    "unit vector remains unchanged",
    (_) => {
      _.x = -1;
      _.y = 0;
      assert(_.normalized.x === -1 && _.normalized.y === 0);
    },

    "infinity results in NaN",
    (_) => {
      _.x = Infinity;
      _.y = Infinity;
      assert(isNaN(_.normalized.x) && isNaN(_.normalized.y));
    },
  ],

  $get_quadrant: () => {
    if (_.x > 0 && _.y > 0) return 1;
    if (_.x < 0 && _.y > 0) return 2;
    if (_.x < 0 && _.y < 0) return 3;
    if (_.x > 0 && _.y < 0) return 4;
    return 0; // Origin or on an axis
  },
  $test_quadrant: [
    "origin is quadrant 0",
    (_) => assert(_.quadrant === 0),

    "quadrant 1",
    (_) => {
      _.x = 1;
      _.y = 1;
      assert(_.quadrant === 1);
    },

    "quadrant 2",
    (_) => {
      _.x = -1;
      _.y = 1;
      assert(_.quadrant === 2);
    },

    "quadrant 3",
    (_) => {
      _.x = -1;
      _.y = -1;
      assert(_.quadrant === 3);
    },

    "quadrant 4",
    (_) => {
      _.x = 1;
      _.y = -1;
      assert(_.quadrant === 4);
    },

    "positive x-axis",
    (_) => {
      _.x = 1;
      _.y = 0;
      assert(_.quadrant === 0);
    },

    "negative x-axis",
    (_) => {
      _.x = -1;
      _.y = 0;
      assert(_.quadrant === 0);
    },

    "positive y-axis",
    (_) => {
      _.x = 0;
      _.y = 1;
      assert(_.quadrant === 0);
    },

    "negative y-axis",
    (_) => {
      _.x = 0;
      _.y = -1;
      assert(_.quadrant === 0);
    },
  ],

  $get_polar: () => {
    const r = Math.sqrt(_.x ** 2 + _.y ** 2);
    const theta = Math.atan2(_.y, _.x);
    return { r, theta };
  },
  $test_polar: [
    "origin",
    (_) => {
      const polar = _.polar;
      assert(polar.r === 0 && polar.theta === 0);
    },

    "positive x-axis",
    (_) => {
      _.x = 1;
      _.y = 0;
      assert(_.polar.r === 1 && _.polar.theta === 0);
    },

    "positive y-axis",
    (_) => {
      _.x = 0;
      _.y = 1;
      assert(_.polar.r === 1 && _.polar.theta === Math.PI / 2);
    },

    "negative x-axis",
    (_) => {
      _.x = -1;
      _.y = 0;
      assert(_.polar.r === 1 && _.polar.theta === Math.PI);
    },

    "negative y-axis",
    (_) => {
      _.x = 0;
      _.y = -1;
      assert(_.polar.r === 1 && _.polar.theta === -Math.PI / 2);
    },

    "45 degrees",
    (_) => {
      _.x = 1;
      _.y = 1;
      assert(
        Math.abs(_.polar.r - Math.sqrt(2)) < 1e-10 &&
          Math.abs(_.polar.theta - Math.PI / 4) < 1e-10
      );
    },
  ],

  Distance: ({ x, y }) => Math.sqrt((_.x - x) ** 2 + (_.y - y) ** 2),
  $test_Distance: [
    "distance to self",
    (_) => assert(_.Distance(Point({ x: 0, y: 0 })) === 0),

    "unit distance on x-axis",
    (_) => assert(_.Distance(Point({ x: 1, y: 0 })) === 1),

    "unit distance on y-axis",
    (_) => assert(_.Distance(Point({ x: 0, y: 1 })) === 1),

    "diagonal distance",
    (_) =>
      assert(
        Math.abs(_.Distance(Point({ x: 1, y: 1 })) - Math.sqrt(2)) < 1e-10
      ),

    "3-4-5 triangle",
    (_) => {
      _.x = 3;
      _.y = 4;
      assert(_.Distance(Point({ x: 0, y: 0 })) === 5);
    },

    "infinite distance",
    (_) => assert(_.Distance(Point({ x: Infinity, y: 0 })) === Infinity),

    "NaN coordinate",
    (_) => assert(isNaN(_.Distance(Point({ x: NaN, y: 0 })))),
  ],

  DistanceX: ({ x }) => Math.abs(_.x - x),
  $test_DistanceX: [
    "zero distance",
    (_) => assert(_.DistanceX(Point({ x: 0 })) === 0),

    "positive distance",
    (_) => assert(_.DistanceX(Point({ x: 5 })) === 5),

    "negative distance",
    (_) => assert(_.DistanceX(Point({ x: -5 })) === 5),

    "across zero",
    (_) => {
      _.x = -3;
      assert(_.DistanceX(Point({ x: 3 })) === 6);
    },

    "infinite distance",
    (_) => assert(_.DistanceX(Point({ x: Infinity })) === Infinity),

    "NaN coordinate",
    (_) => assert(isNaN(_.DistanceX(Point({ x: NaN })))),
  ],

  DistanceY: ({ y }) => Math.abs(_.y - y),
  $test_DistanceY: [
    "zero distance",
    (_) => assert(_.DistanceY(Point({ y: 0 })) === 0),

    "positive distance",
    (_) => assert(_.DistanceY(Point({ y: 5 })) === 5),

    "negative distance",
    (_) => assert(_.DistanceY(Point({ y: -5 })) === 5),

    "across zero",
    (_) => {
      _.y = -3;
      assert(_.DistanceY(Point({ y: 3 })) === 6);
    },

    "infinite distance",
    (_) => assert(_.DistanceY(Point({ y: Infinity })) === Infinity),

    "NaN coordinate",
    (_) => assert(isNaN(_.DistanceY(Point({ y: NaN })))),
  ],

  DistanceToOrigin: () => Math.sqrt(_.x ** 2 + _.y ** 2),
  $test_DistanceToOrigin: [
    "at origin",
    (_) => assert(_.DistanceToOrigin() === 0),

    "3-4-5 triangle",
    (_) => {
      _.x = 3;
      _.y = 4;
      assert(_.DistanceToOrigin() === 5);
    },

    "unit distance on negative x-axis",
    (_) => {
      _.x = -1;
      _.y = 0;
      assert(_.DistanceToOrigin() === 1);
    },

    "unit distance on negative y-axis",
    (_) => {
      _.x = 0;
      _.y = -1;
      assert(_.DistanceToOrigin() === 1);
    },

    "infinite coordinate",
    (_) => {
      _.x = Infinity;
      _.y = 0;
      assert(_.DistanceToOrigin() === Infinity);
    },

    "NaN coordinate",
    (_) => {
      _.x = NaN;
      _.y = 0;
      assert(isNaN(_.DistanceToOrigin()));
    },
  ],

  Midpoint: ({ x, y }) => Point({ x: (_.x + x) / 2, y: (_.y + y) / 2 }),
  $test_Midpoint: [
    "midpoint with origin",
    (_) => {
      const mid = _.Midpoint(Point({ x: 0, y: 0 }));
      assert(mid.x === 0 && mid.y === 0);
    },

    "midpoint across origin",
    (_) => {
      _.x = 2;
      _.y = 2;
      const mid = _.Midpoint(Point({ x: -2, y: -2 }));
      assert(mid.x === 0 && mid.y === 0);
    },

    "positive coordinates",
    (_) => {
      _.x = 2;
      _.y = 2;
      const mid = _.Midpoint(Point({ x: 4, y: 4 }));
      assert(mid.x === 3 && mid.y === 3);
    },

    "infinite coordinates",
    (_) => {
      const mid = _.Midpoint(Point({ x: Infinity, y: Infinity }));
      assert(mid.x === Infinity && mid.y === Infinity);
    },

    "NaN coordinates",
    (_) => {
      const mid = _.Midpoint(Point({ x: NaN, y: NaN }));
      assert(isNaN(mid.x) && isNaN(mid.y));
    },
  ],

  DeltaX: ({ x }) => _.x - x,
  $test_DeltaX: [
    "zero delta",
    (_) => assert(_.DeltaX(Point({ x: 0 })) === 0),

    "positive delta",
    (_) => {
      _.x = 5;
      assert(_.DeltaX(Point({ x: 2 })) === 3);
    },

    "negative delta",
    (_) => {
      _.x = 5;
      assert(_.DeltaX(Point({ x: 8 })) === -3);
    },

    "infinite delta",
    (_) => {
      _.x = 5;
      assert(_.DeltaX(Point({ x: Infinity })) === -Infinity);
    },

    "NaN coordinate",
    (_) => {
      _.x = 5;
      assert(isNaN(_.DeltaX(Point({ x: NaN }))));
    },
  ],

  DeltaY: ({ y }) => _.y - y,
  $test_DeltaY: [
    "zero delta",
    (_) => assert(_.DeltaY(Point({ y: 0 })) === 0),

    "positive delta",
    (_) => {
      _.y = 5;
      assert(_.DeltaY(Point({ y: 2 })) === 3);
    },

    "negative delta",
    (_) => {
      _.y = 5;
      assert(_.DeltaY(Point({ y: 8 })) === -3);
    },

    "infinite delta",
    (_) => {
      _.y = 5;
      assert(_.DeltaY(Point({ y: Infinity })) === -Infinity);
    },

    "NaN coordinate",
    (_) => {
      _.y = 5;
      assert(isNaN(_.DeltaY(Point({ y: NaN }))));
    },
  ],

  DotProduct: ({ x, y }) => _.x * x + _.y * y,
  $test_DotProduct: [
    "dot product with zero vector",
    (_) => assert(_.DotProduct(Point({ x: 0, y: 0 })) === 0),

    "positive coordinates",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(_.DotProduct(Point({ x: 3, y: 4 })) === 11);
    },

    "negative coordinates",
    (_) => {
      _.x = -1;
      _.y = -2;
      assert(_.DotProduct(Point({ x: 3, y: 4 })) === -11);
    },

    "infinite coordinate",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(_.DotProduct(Point({ x: Infinity, y: 0 })) === Infinity);
    },

    "NaN coordinate",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(isNaN(_.DotProduct(Point({ x: NaN, y: 0 }))));
    },
  ],

  CrossProduct: ({ x, y }) => _.x * y - _.y * x,
  $test_CrossProduct: [
    "cross product with zero vector",
    (_) => assert(_.CrossProduct(Point({ x: 0, y: 0 })) === 0),

    "positive coordinates",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(_.CrossProduct(Point({ x: 3, y: 4 })) === -2);
    },

    "negative coordinates",
    (_) => {
      _.x = -1;
      _.y = -2;

      assert(_.CrossProduct(Point({ x: 3, y: 4 })) === 2);
    },

    "infinite coordinate",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(_.CrossProduct(Point({ x: 0, y: 0 })) === 0);
    },

    "NaN coordinate",
    (_) => {
      _.x = 1;
      _.y = 2;
      assert(isNaN(_.CrossProduct(Point({ x: NaN, y: 0 }))));
    },
  ],

  Clone: () => Point({ x: _.x, y: _.y }),
  $test_Clone: [
    "clone has same coordinates",
    (_) => {
      const clone = _.Clone();
      assert(clone.x === _.x && clone.y === _.y);
    },

    "clone is a different object",
    (_) => {
      const clone = _.Clone();
      assert(clone !== _);
    },

    "clone reflects current state",
    (_) => {
      _.x = 5;
      _.y = 10;
      const clone = _.Clone();
      assert(clone.x === 5 && clone.y === 10);
    },

    "clone with special values",
    (_) => {
      _.x = Infinity;
      _.y = NaN;
      const clone = _.Clone();
      assert(clone.x === Infinity && isNaN(clone.y));
    },
  ],

  TransformMatrix: (a, b, c, d, e, f) => {
    const newX = a * _.x + c * _.y + e;
    const newY = b * _.x + d * _.y + f;
    _.x = newX;
    _.y = newY;
    return _;
  },
  $test_TransformMatrix: [
    "scale and translate",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.TransformMatrix(2, 0, 0, 2, 1, 1);
      assert(_.x === 3 && _.y === 5);
    },

    "90 degree rotation",
    (_) => {
      _.x = 1;
      _.y = 0;
      _.TransformMatrix(0, -1, 1, 0, 0, 0);
      assert(Math.abs(_.x) < 1e-10 && Math.abs(_.y + 1) < 1e-10);
    },

    "identity transformation",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.TransformMatrix(1, 0, 0, 1, 0, 0);
      assert(_.x === 1 && _.y === 1);
    },

    "infinite coefficient",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.TransformMatrix(Infinity, 0, 0, 1, 0, 0);
      assert(_.x === Infinity && _.y === 1);
    },

    "NaN coefficient",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.TransformMatrix(NaN, 0, 0, 1, 0, 0);
      assert(isNaN(_.x) && _.y === 1);
    },
  ],

  Set: ({ x, y }) => {
    _.x = x;
    _.y = y;
    return _;
  },
  $test_Set: [
    "set positive integers",
    (_) => {
      _.Set(Point({ x: 3, y: 4 }));
      assert(_.x === 3 && _.y === 4);
    },

    "set floating point numbers",
    (_) => {
      _.Set(Point({ x: -1.5, y: 2.5 }));
      assert(_.x === -1.5 && _.y === 2.5);
    },

    "set infinity",
    (_) => {
      _.Set(Point({ x: Infinity, y: -Infinity }));
      assert(_.x === Infinity && _.y === -Infinity);
    },

    "set NaN",
    (_) => {
      _.Set(Point({ x: NaN, y: 0 }));
      assert(isNaN(_.x) && _.y === 0);
    },
  ],

  Floor: () => {
    _.x = Math.floor(_.x);
    _.y = Math.floor(_.y);
    return _;
  },
  $test_Floor: [
    "floor positive and negative",
    (_) => {
      _.x = 3.7;
      _.y = -2.1;
      _.Floor();
      assert(_.x === 3 && _.y === -3);
    },

    "floor near zero",
    (_) => {
      _.x = 0.1;
      _.y = -0.1;
      _.Floor();
      assert(_.x === 0 && _.y === -1);
    },

    "floor infinity",
    (_) => {
      _.x = Infinity;
      _.y = -Infinity;
      _.Floor();
      assert(_.x === Infinity && _.y === -Infinity);
    },

    "floor NaN",
    (_) => {
      _.x = NaN;
      _.y = 1;
      _.Floor();
      assert(isNaN(_.x) && _.y === 1);
    },
  ],

  Ceil: () => {
    _.x = Math.ceil(_.x);
    _.y = Math.ceil(_.y);
    return _;
  },
  $test_Ceil: [
    "ceil positive and negative",
    (_) => {
      _.x = 3.2;
      _.y = -2.8;
      _.Ceil();
      assert(_.x === 4 && _.y === -2);
    },

    "ceil near zero",
    (_) => {
      _.x = 0.1;
      _.y = -0.1;
      _.Ceil();
      assert(_.x === 1 && _.y === 0);
    },

    "ceil infinity",
    (_) => {
      _.x = Infinity;
      _.y = -Infinity;
      _.Ceil();
      assert(_.x === Infinity && _.y === -Infinity);
    },

    "ceil NaN",
    (_) => {
      _.x = NaN;
      _.y = 1;
      _.Ceil();
      assert(isNaN(_.x) && _.y === 1);
    },
  ],

  Round: () => {
    _.x = Math.round(_.x);
    _.y = Math.round(_.y);
    return _;
  },
  $test_Round: [
    "round up and down",
    (_) => {
      _.x = 3.4;
      _.y = 3.6;
      _.Round();
      assert(_.x === 3 && _.y === 4);
    },

    "round negative numbers",
    (_) => {
      _.x = -3.4;
      _.y = -3.6;
      _.Round();
      assert(_.x === -3 && _.y === -4);
    },

    "round at 0.5",
    (_) => {
      _.x = 0.5;
      _.y = -0.5;
      _.Round();
      assert(_.x === 1 && _.y === 0);
    },

    "round infinity",
    (_) => {
      _.x = Infinity;
      _.y = -Infinity;
      _.Round();
      assert(_.x === Infinity && _.y === -Infinity);
    },

    "round NaN",
    (_) => {
      _.x = NaN;
      _.y = 1;
      _.Round();
      assert(isNaN(_.x) && _.y === 1);
    },
  ],

  Add: ({ x, y }) => {
    _.x += x;
    _.y += y;
    return _;
  },
  $test_Add: [
    "add positive integers",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.Add(Point({ x: 3, y: 4 }));
      assert(_.x === 4 && _.y === 6);
    },

    "add negative integers",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.Add(Point({ x: -1, y: -2 }));
      assert(_.x === 0 && _.y === 0);
    },

    "add floating point",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.Add(Point({ x: 0.1, y: -0.1 }));
      assert(Math.abs(_.x - 1.1) < 1e-10 && Math.abs(_.y - 1.9) < 1e-10);
    },

    "add infinity",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.Add(Point({ x: Infinity, y: -Infinity }));
      assert(_.x === Infinity && _.y === -Infinity);
    },

    "add NaN",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.Add(Point({ x: NaN, y: 5 }));
      assert(isNaN(_.x) && _.y === 7);
    },
  ],

  Subtract: ({ x, y }) => {
    _.x -= x;
    _.y -= y;
    return _;
  },
  $test_Subtract: [
    "subtract positive integers",
    (_) => {
      _.x = 5;
      _.y = 7;
      _.Subtract(Point({ x: 3, y: 4 }));
      assert(_.x === 2 && _.y === 3);
    },

    "subtract negative integers",
    (_) => {
      _.x = 5;
      _.y = 7;
      _.Subtract(Point({ x: -1, y: -2 }));
      assert(_.x === 6 && _.y === 9);
    },

    "subtract floating point",
    (_) => {
      _.x = 5;
      _.y = 7;
      _.Subtract(Point({ x: 0.1, y: -0.1 }));
      assert(Math.abs(_.x - 4.9) < 1e-10 && Math.abs(_.y - 7.1) < 1e-10);
    },

    "subtract infinity",
    (_) => {
      _.x = 5;
      _.y = 7;
      _.Subtract(Point({ x: Infinity, y: -Infinity }));
      assert(_.x === -Infinity && _.y === Infinity);
    },

    "subtract NaN",
    (_) => {
      _.x = 5;
      _.y = 7;
      _.Subtract(Point({ x: NaN, y: 5 }));
      assert(isNaN(_.x) && _.y === 2);
    },
  ],

  Clamp: (min, max) => {
    _.x = Math.max(min, Math.min(max, _.x));
    _.y = Math.max(min, Math.min(max, _.y));
    return _;
  },
  $test_Clamp: [
    "clamp within and outside range",
    (_) => {
      _.x = 5;
      _.y = -5;
      _.Clamp(0, 10);
      assert(_.x === 5 && _.y === 0);
    },

    "clamp outside range on both sides",
    (_) => {
      _.x = 15;
      _.y = -15;
      _.Clamp(0, 10);
      assert(_.x === 10 && _.y === 0);
    },

    "clamp with infinite max",
    (_) => {
      _.x = 5;
      _.y = 5;
      _.Clamp(0, Infinity);
      assert(_.x === 5 && _.y === 5);
    },

    "clamp with infinite min",
    (_) => {
      _.x = -5;
      _.y = -5;
      _.Clamp(-Infinity, 0);
      assert(_.x === -5 && _.y === -5);
    },

    "clamp with NaN",
    (_) => {
      _.x = NaN;
      _.y = 5;
      _.Clamp(0, 10);
      assert(isNaN(_.x) && _.y === 5);
    },
  ],

  Normalize: () => {
    const magnitude = Math.sqrt(_.x ** 2 + _.y ** 2);
    if (magnitude > 0) {
      _.x /= magnitude;
      _.y /= magnitude;
    }
    return _;
  },
  $test_Normalize: [
    "normalize 3-4-5 triangle",
    (_) => {
      _.x = 3;
      _.y = 4;
      _.Normalize();
      assert(Math.abs(_.x - 0.6) < 1e-10 && Math.abs(_.y - 0.8) < 1e-10);
    },

    "normalize zero vector",
    (_) => {
      _.x = 0;
      _.y = 0;
      _.Normalize();
      assert(_.x === 0 && _.y === 0);
    },

    "normalize unit vector",
    (_) => {
      _.x = -1;
      _.y = 0;
      _.Normalize();
      assert(_.x === -1 && _.y === 0);
    },

    "normalize infinity",
    (_) => {
      _.x = Infinity;
      _.y = Infinity;
      _.Normalize();
      assert(isNaN(_.x) && isNaN(_.y));
    },
  ],

  Lerp: ({ x, y }, t) => {
    return Point({ x: _.x + (x - _.x) * t, y: _.y + (y - _.y) * t });
  },
  $test_Lerp: [
    "lerp midpoint",
    (_) => {
      _.x = 0;
      _.y = 0;
      const mid = _.Lerp(Point({ x: 10, y: 10 }), 0.5);
      assert(mid.x === 5 && mid.y === 5);
    },

    "lerp start point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const start = _.Lerp(Point({ x: 10, y: 10 }), 0);
      assert(start.x === 0 && start.y === 0);
    },

    "lerp end point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const end = _.Lerp(Point({ x: 10, y: 10 }), 1);
      assert(end.x === 10 && end.y === 10);
    },

    "lerp beyond end point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const beyond = _.Lerp(Point({ x: 10, y: 10 }), 2);
      assert(beyond.x === 20 && beyond.y === 20);
    },

    "lerp before start point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const before = _.Lerp(Point({ x: 10, y: 10 }), -1);
      assert(before.x === -10 && before.y === -10);
    },

    "lerp with infinity",
    (_) => {
      _.x = 0;
      _.y = 0;
      const infLerp = _.Lerp(Point({ x: Infinity, y: Infinity }), 0.5);
      assert(infLerp.x === Infinity && infLerp.y === Infinity);
    },

    "lerp with NaN",
    (_) => {
      _.x = 0;
      _.y = 0;
      const nanLerp = _.Lerp(Point({ x: NaN, y: 10 }), 0.5);
      assert(isNaN(nanLerp.x) && nanLerp.y === 5);
    },
  ],

  ProjectOnto: ({ x, y }) => {
    const dotProduct = _.x * x + _.y * y;
    const magnitudeSquared = x * x + y * y;
    const scalar = dotProduct / magnitudeSquared;
    return Point({ x: scalar * x, y: scalar * y });
  },
  $test_ProjectOnto: [
    "project onto x-axis",
    (_) => {
      _.x = 3;
      _.y = 4;
      const proj = _.ProjectOnto(Point({ x: 1, y: 0 }));
      assert(proj.x === 3 && proj.y === 0);
    },

    "project onto y-axis",
    (_) => {
      _.x = 3;
      _.y = 4;
      const proj = _.ProjectOnto(Point({ x: 0, y: 1 }));
      assert(proj.x === 0 && proj.y === 4);
    },

    "project onto diagonal",
    (_) => {
      _.x = 3;
      _.y = 4;
      const proj = _.ProjectOnto(Point({ x: 1, y: 1 }));
      assert(Math.abs(proj.x - 3.5) < 1e-10 && Math.abs(proj.y - 3.5) < 1e-10);
    },

    "project onto zero vector",
    (_) => {
      _.x = 3;
      _.y = 4;
      const proj = _.ProjectOnto(Point({ x: 0, y: 0 }));
      assert(isNaN(proj.x) && isNaN(proj.y));
    },

    "project infinity",
    (_) => {
      _.x = Infinity;
      _.y = 4;
      const { x, y } = _.ProjectOnto(Point({ x: 1, y: 1 }));
      assert(x === Infinity && y === Infinity);
    },
  ],

  Scale: ({ x, y }) => {
    _.x *= x;
    _.y *= y;
    return _;
  },
  $test_Scale: [
    "scale by positive integers",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Scale(Point({ x: 2, y: 3 }));
      assert(_.x === 4 && _.y === 9);
    },

    "scale by negative numbers",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Scale(Point({ x: -1, y: -2 }));
      assert(_.x === -2 && _.y === -6);
    },

    "scale by zero",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Scale(Point({ x: 0, y: 0 }));
      assert(_.x === 0 && _.y === 0);
    },

    "scale by infinity",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Scale(Point({ x: Infinity, y: Infinity }));
      assert(_.x === Infinity && _.y === Infinity);
    },

    "scale by NaN",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Scale(Point({ x: NaN, y: 2 }));
      assert(isNaN(_.x) && _.y === 6);
    },
  ],

  ScaleX: (factor) => {
    _.x *= factor;
    return _;
  },
  $test_ScaleX: [
    "scale x by positive number",
    (_) => {
      _.x = 2;
      _.ScaleX(3);
      assert(_.x === 6);
    },

    "scale x by negative number",
    (_) => {
      _.x = 2;
      _.ScaleX(-1);
      assert(_.x === -2);
    },

    "scale x by zero",
    (_) => {
      _.x = 2;
      _.ScaleX(0);
      assert(_.x === 0);
    },

    "scale x by infinity",
    (_) => {
      _.x = 2;
      _.ScaleX(Infinity);
      assert(_.x === Infinity);
    },

    "scale x by NaN",
    (_) => {
      _.x = 2;
      _.ScaleX(NaN);
      assert(isNaN(_.x));
    },
  ],

  ScaleY: (factor) => {
    _.y *= factor;
    return _;
  },
  $test_ScaleY: [
    "scale y by positive number",
    (_) => {
      _.y = 3;
      _.ScaleY(2);
      assert(_.y === 6);
    },

    "scale y by negative number",
    (_) => {
      _.y = 3;
      _.ScaleY(-1);
      assert(_.y === -3);
    },

    "scale y by zero",
    (_) => {
      _.y = 3;
      _.ScaleY(0);
      assert(_.y === 0);
    },

    "scale y by infinity",
    (_) => {
      _.y = 3;
      _.ScaleY(Infinity);
      assert(_.y === Infinity);
    },

    "scale y by NaN",
    (_) => {
      _.y = 3;
      _.ScaleY(NaN);
      assert(isNaN(_.y));
    },
  ],

  Slope: ({ x, y }) => {
    return (_.y - y) / (_.x - x);
  },
  $test_Slope: [
    "positive slope",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(_.Slope(Point({ x: 1, y: 1 })) === 1);
    },

    "negative slope",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(_.Slope(Point({ x: 1, y: -1 })) === -1);
    },

    "vertical line",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(_.Slope(Point({ x: 0, y: 1 })) === -Infinity);
    },

    "horizontal line",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(_.Slope(Point({ x: 1, y: 0 })) === 0);
    },

    "same point",
    (_) => {
      _.x = 1;
      _.y = 1;
      assert(isNaN(_.Slope(Point({ x: 1, y: 1 }))));
    },
  ],

  AngleWith: ({ x, y }) => {
    return Math.atan2(y - _.y, x - _.x) * (180 / Math.PI);
  },
  $test_AngleWith: [
    "0 degrees",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(Math.abs(_.AngleWith(Point({ x: 1, y: 0 }))) < 1e-10);
    },

    "90 degrees",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(Math.abs(_.AngleWith(Point({ x: 0, y: 1 })) - 90) < 1e-10);
    },

    "180 degrees",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(
        Math.abs(Math.abs(_.AngleWith(Point({ x: -1, y: 0 }))) - 180) < 1e-10
      );
    },

    "45 degrees",
    (_) => {
      _.x = 0;
      _.y = 0;
      assert(Math.abs(_.AngleWith(Point({ x: 1, y: 1 })) - 45) < 1e-10);
    },

    "same point",
    (_) => {
      _.x = 1;
      _.y = 1;
      assert(_.AngleWith(Point({ x: 1, y: 1 })) === 0);
    },
  ],

  Reflect: ({ x, y }) => {
    _.x = 2 * x - _.x;
    _.y = 2 * y - _.y;
    return _;
  },
  $test_Reflect: [
    "reflect over y-axis",
    (_) => {
      _.x = 1;
      _.y = 2;
      _.Reflect(Point({ x: 0, y: 0 }));
      assert(_.x === -1 && _.y === -2);
    },

    "reflect over x=1",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Reflect(Point({ x: 1, y: 0 }));
      assert(_.x === 0 && _.y === -3);
    },

    "reflect over y=1",
    (_) => {
      _.x = 2;
      _.y = 0;
      _.Reflect(Point({ x: 0, y: 1 }));
      assert(_.x === -2 && _.y === 2);
    },

    "reflect over itself",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.Reflect(Point({ x: 1, y: 1 }));
      assert(_.x === 1 && _.y === 1);
    },
  ],

  ReflectX: () => {
    _.x = -_.x;
    return _;
  },
  $test_ReflectX: [
    "reflect positive x",
    (_) => {
      _.x = 5;
      _.ReflectX();
      assert(_.x === -5);
    },

    "reflect negative x",
    (_) => {
      _.x = -3;
      _.ReflectX();
      assert(_.x === 3);
    },

    "reflect zero",
    (_) => {
      _.x = 0;
      _.ReflectX();
      assert(_.x === 0);
    },

    "reflect infinity",
    (_) => {
      _.x = Infinity;
      _.ReflectX();
      assert(_.x === -Infinity);
    },
  ],

  ReflectY: () => {
    _.y = -_.y;
    return _;
  },
  $test_ReflectY: [
    "reflect positive y",
    (_) => {
      _.y = 5;
      _.ReflectY();
      assert(_.y === -5);
    },

    "reflect negative y",
    (_) => {
      _.y = -3;
      _.ReflectY();
      assert(_.y === 3);
    },

    "reflect zero",
    (_) => {
      _.y = 0;
      _.ReflectY();
      assert(_.y === 0);
    },

    "reflect infinity",
    (_) => {
      _.y = Infinity;
      _.ReflectY();
      assert(_.y === -Infinity);
    },
  ],

  Rotate: (angle) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = _.x * cos - _.y * sin;
    const y = _.x * sin + _.y * cos;
    _.x = x;
    _.y = y;
    return _;
  },
  $test_Rotate: [
    "rotate 90 degrees",
    (_) => {
      _.x = 1;
      _.y = 0;
      _.Rotate(90);
      assert(Math.abs(_.x) < 1e-10 && Math.abs(_.y - 1) < 1e-10);
    },

    "rotate 180 degrees",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.Rotate(180);
      assert(Math.abs(_.x + 1) < 1e-10 && Math.abs(_.y + 1) < 1e-10);
    },

    "rotate 360 degrees",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.Rotate(360);
      assert(Math.abs(_.x - 2) < 1e-10 && Math.abs(_.y - 3) < 1e-10);
    },

    "rotate -45 degrees",
    (_) => {
      _.x = 1;
      _.y = 0;
      _.Rotate(-45);
      assert(
        Math.abs(_.x - Math.sqrt(2) / 2) < 1e-10 &&
          Math.abs(_.y + Math.sqrt(2) / 2) < 1e-10
      );
    },
  ],

  RotateX: (angle) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    _.y = _.y * cos;
    return _;
  },

  $test_RotateX: [
    "rotate 90 degrees around X-axis",
    (_) => {
      _.y = 1;
      _.RotateX(90);
      assert(Math.abs(_.y) < 1e-10);
    },

    "rotate 180 degrees around X-axis",
    (_) => {
      _.y = 1;
      _.RotateX(180);
      assert(Math.abs(_.y + 1) < 1e-10);
    },

    "rotate 360 degrees around X-axis",
    (_) => {
      _.y = 2;
      _.RotateX(360);
      assert(Math.abs(_.y - 2) < 1e-10);
    },

    "rotate -45 degrees around X-axis",
    (_) => {
      _.y = 1;
      _.RotateX(-45);
      assert(Math.abs(_.y - Math.sqrt(2) / 2) < 1e-10);
    },
  ],

  RotateY: (angle) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    _.x = _.x * cos;
    return _;
  },

  $test_RotateY: [
    "rotate 90 degrees around Y-axis",
    (_) => {
      _.x = 1;
      _.RotateY(90);
      assert(Math.abs(_.x) < 1e-10);
    },

    "rotate 180 degrees around Y-axis",
    (_) => {
      _.x = 1;
      _.RotateY(180);
      assert(Math.abs(_.x + 1) < 1e-10);
    },

    "rotate 360 degrees around Y-axis",
    (_) => {
      _.x = 2;
      _.RotateY(360);
      assert(Math.abs(_.x - 2) < 1e-10);
    },

    "rotate -45 degrees around Y-axis",
    (_) => {
      _.x = 1;
      _.RotateY(-45);
      assert(Math.abs(_.x - Math.sqrt(2) / 2) < 1e-10);
    },
  ],

  RotateAround: ({ x, y }, angle) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = _.x - x;
    const dy = _.y - y;
    _.x = x + dx * cos - dy * sin;
    _.y = y + dx * sin + dy * cos;
    return _;
  },
  $test_RotateAround: [
    "rotate around origin",
    (_) => {
      _.x = 1;
      _.y = 0;
      _.RotateAround(Point({ x: 0, y: 0 }), 90);
      assert(Math.abs(_.x) < 1e-10 && Math.abs(_.y - 1) < 1e-10);
    },

    "rotate around (1,1)",
    (_) => {
      _.x = 2;
      _.y = 1;
      _.RotateAround(Point({ x: 1, y: 1 }), 90);
      assert(Math.abs(_.x - 1) < 1e-10 && Math.abs(_.y - 2) < 1e-10);
    },

    "rotate 360 degrees",
    (_) => {
      _.x = 2;
      _.y = 3;
      _.RotateAround(Point({ x: 1, y: 1 }), 360);
      assert(Math.abs(_.x - 2) < 1e-10 && Math.abs(_.y - 3) < 1e-10);
    },
  ],

  PointBetween: ({ x, y }, percentage) => {
    const newX = _.x + (x - _.x) * percentage;
    const newY = _.y + (y - _.y) * percentage;
    return Point({ x: newX, y: newY });
  },
  $test_PointBetween: [
    "midpoint",
    (_) => {
      _.x = 0;
      _.y = 0;
      const mid = _.PointBetween(Point({ x: 2, y: 2 }), 0.5);
      assert(mid.x === 1 && mid.y === 1);
    },

    "quarter point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const quarter = _.PointBetween(Point({ x: 4, y: 4 }), 0.25);
      assert(quarter.x === 1 && quarter.y === 1);
    },

    "beyond end point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const beyond = _.PointBetween(Point({ x: 1, y: 1 }), 2);
      assert(beyond.x === 2 && beyond.y === 2);
    },

    "before start point",
    (_) => {
      _.x = 0;
      _.y = 0;
      const before = _.PointBetween(Point({ x: 1, y: 1 }), -1);
      assert(before.x === -1 && before.y === -1);
    },
  ],

  Translate: (dx, dy) => {
    _.x += dx;
    _.y += dy;
    return _;
  },
  $test_Translate: [
    "positive translation",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.Translate(2, 3);
      assert(_.x === 3 && _.y === 4);
    },

    "negative translation",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.Translate(-2, -3);
      assert(_.x === -1 && _.y === -2);
    },

    "zero translation",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.Translate(0, 0);
      assert(_.x === 1 && _.y === 1);
    },

    "translate to infinity",
    (_) => {
      _.x = 1;
      _.y = 1;
      _.Translate(Infinity, Infinity);
      assert(_.x === Infinity && _.y === Infinity);
    },
  ],

  TranslateX: (dx) => {
    _.x += dx;
    return _;
  },
  $test_TranslateX: [
    "positive translation",
    (_) => {
      _.x = 1;
      _.TranslateX(2);
      assert(_.x === 3);
    },

    "negative translation",
    (_) => {
      _.x = 1;
      _.TranslateX(-2);
      assert(_.x === -1);
    },

    "zero translation",
    (_) => {
      _.x = 1;
      _.TranslateX(0);
      assert(_.x === 1);
    },

    "translate to infinity",
    (_) => {
      _.x = 1;
      _.TranslateX(Infinity);
      assert(_.x === Infinity);
    },
  ],

  TranslateY: (dy) => {
    _.y += dy;
    return _;
  },
  $test_TranslateY: [
    "positive translation",
    (_) => {
      _.y = 1;
      _.TranslateY(2);
      assert(_.y === 3);
    },

    "negative translation",
    (_) => {
      _.y = 1;
      _.TranslateY(-2);
      assert(_.y === -1);
    },

    "zero translation",
    (_) => {
      _.y = 1;
      _.TranslateY(0);
      assert(_.y === 1);
    },

    "translate to infinity",
    (_) => {
      _.y = 1;
      _.TranslateY(Infinity);
      assert(_.y === Infinity);
    },
  ],

  Move: (x, y) => {
    _.x = x;
    _.y = y;
    return _;
  },
  $test_Move: [
    "move to positive coordinates",
    (_) => {
      _.Move(3, 4);
      assert(_.x === 3 && _.y === 4);
    },

    "move to negative coordinates",
    (_) => {
      _.Move(-3, -4);
      assert(_.x === -3 && _.y === -4);
    },

    "move to origin",
    (_) => {
      _.Move(0, 0);
      assert(_.x === 0 && _.y === 0);
    },

    "move to infinity",
    (_) => {
      _.Move(Infinity, Infinity);
      assert(_.x === Infinity && _.y === Infinity);
    },
  ],

  MoveX: (x) => {
    _.x = x;
    return _;
  },
  $test_MoveX: [
    "move to positive x",
    (_) => {
      _.MoveX(5);
      assert(_.x === 5);
    },

    "move to negative x",
    (_) => {
      _.MoveX(-5);
      assert(_.x === -5);
    },

    "move to zero x",
    (_) => {
      _.MoveX(0);
      assert(_.x === 0);
    },

    "move to infinity x",
    (_) => {
      _.MoveX(Infinity);
      assert(_.x === Infinity);
    },
  ],

  MoveY: (y) => {
    _.y = y;
    return _;
  },
  $test_MoveY: [
    "move to positive y",
    (_) => {
      _.MoveY(5);
      assert(_.y === 5);
    },

    "move to negative y",
    (_) => {
      _.MoveY(-5);
      assert(_.y === -5);
    },

    "move to zero y",
    (_) => {
      _.MoveY(0);
      assert(_.y === 0);
    },

    "move to infinity y",
    (_) => {
      _.MoveY(Infinity);
      assert(_.y === Infinity);
    },
  ],
}));

window.Points = Type("Points", (_) => ({
  points: [],
  $test_points: [
    "default is empty array",
    (_) => assert(_.points.matches([])),

    "can add points",
    (_) => {
      _.points.push(Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 }));
      assert(
        _.points.matches([
          { x: 1, y: 2 },
          { x: 3, y: 4 },
        ])
      );
    },
  ],

  TransformMatrix: (a, b, c, d, e, f) => {
    _.points.forEach((p) => p.TransformMatrix(a, b, c, d, e, f));
    return _;
  },
  $test_TransformMatrix: [
    "applies transformation to all points",
    (_) => {
      _.points = [Point({ x: 1, y: 1 }), Point({ x: 2, y: 2 })];
      _.TransformMatrix(2, 0, 0, 2, 1, 1);
      assert(
        _.points.matches([
          { x: 3, y: 3 },
          { x: 5, y: 5 },
        ])
      );
    },
  ],

  Skew: (horizontalFactor, verticalFactor) => {
    _.points.forEach((p) => {
      const newX = p.x + horizontalFactor * p.y;
      const newY = p.y + verticalFactor * p.x;
      p.x = newX;
      p.y = newY;
    });
    return _;
  },
  $test_Skew: [
    "applies skew to all points",
    (_) => {
      _.points = [Point({ x: 1, y: 1 }), Point({ x: 2, y: 2 })];
      _.Skew(0.5, 0.5);
      assert(
        _.points.matches([
          { x: 1.5, y: 1.5 },
          { x: 3, y: 3 },
        ])
      );
    },
  ],

  Floor: () => {
    _.points.forEach((p) => p.Floor());
    return _;
  },
  $test_Floor: [
    "applies floor to all points",
    (_) => {
      _.points = [Point({ x: 1.6, y: 1.4 }), Point({ x: 2.3, y: 2.8 })];
      _.Floor();
      assert(
        _.points.matches([
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ])
      );
    },
  ],

  Ceil: () => {
    _.points.forEach((p) => p.Ceil());
    return _;
  },
  $test_Ceil: [
    "applies ceil to all points",
    (_) => {
      _.points = [Point({ x: 1.6, y: 1.4 }), Point({ x: 2.3, y: 2.8 })];
      _.Ceil();
      assert(
        _.points.matches([
          { x: 2, y: 2 },
          { x: 3, y: 3 },
        ])
      );
    },
  ],

  Round: () => {
    _.points.forEach((p) => p.Round());
    return _;
  },
  $test_Round: [
    "applies round to all points",
    (_) => {
      _.points = [Point({ x: 1.6, y: 1.4 }), Point({ x: 2.3, y: 2.8 })];
      _.Round();
      assert(
        _.points.matches([
          { x: 2, y: 1 },
          { x: 2, y: 3 },
        ])
      );
    },
  ],

  Add: ({ x, y }) => {
    _.points.forEach((p) => p.Add({ x, y }));
    return _;
  },
  $test_Add: [
    "adds to all points",
    (_) => {
      _.points = [Point({ x: 1, y: 1 }), Point({ x: 2, y: 2 })];
      _.Add({ x: 1, y: 2 });
      assert(
        _.points.matches([
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ])
      );
    },
  ],

  Subtract: ({ x, y }) => {
    _.points.forEach((p) => p.Subtract({ x, y }));
    return _;
  },
  $test_Subtract: [
    "subtracts from all points",
    (_) => {
      _.points = [Point({ x: 3, y: 3 }), Point({ x: 4, y: 4 })];
      _.Subtract({ x: 1, y: 2 });
      assert(
        _.points.matches([
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ])
      );
    },
  ],

  Normalize: () => {
    _.points.forEach((p) => p.Normalize());
    return _;
  },
  $test_Normalize: [
    "normalizes all points",
    (_) => {
      _.points = [Point({ x: 3, y: 4 }), Point({ x: -3, y: -4 })];
      _.Normalize();
      assert(_.points[0].x - 0.6 < 1e-10 && _.points[0].y - 0.8 < 1e-10);
      assert(_.points[1].x + 0.6 < 1e-10 && _.points[1].y + 0.8 < 1e-10);
    },
  ],

  Scale: ({ x, y }) => {
    _.points.forEach((p) => p.Scale({ x, y }));
    return _;
  },
  $test_Scale: [
    "scales all points",
    (_) => {
      _.points = [Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 })];
      _.Scale({ x: 2, y: 3 });
      assert(
        _.points.matches([
          { x: 2, y: 6 },
          { x: 6, y: 12 },
        ])
      );
    },
  ],

  ScaleX: (factor) => {
    _.points.forEach((p) => p.ScaleX(factor));
    return _;
  },
  $test_ScaleX: [
    "scales x of all points",
    (_) => {
      _.points = [Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 })];
      _.ScaleX(2);
      assert(
        _.points.matches([
          { x: 2, y: 2 },
          { x: 6, y: 4 },
        ])
      );
    },
  ],

  ScaleY: (factor) => {
    _.points.forEach((p) => p.ScaleY(factor));
    return _;
  },
  $test_ScaleY: [
    "scales y of all points",
    (_) => {
      _.points = [Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 })];
      _.ScaleY(2);
      assert(
        _.points.matches([
          { x: 1, y: 4 },
          { x: 3, y: 8 },
        ])
      );
    },
  ],

  Reflect: ({ x, y }) => {
    _.points.forEach((p) => p.Reflect({ x, y }));
    return _;
  },
  $test_Reflect: [
    "reflects all points",
    (_) => {
      _.points = [Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 })];
      _.Reflect({ x: 0, y: 0 });
      assert(
        _.points.matches([
          { x: -1, y: -2 },
          { x: -3, y: -4 },
        ])
      );
    },
  ],

  ReflectX: () => {
    _.points.forEach((p) => p.ReflectX());
    return _;
  },
  $test_ReflectX: [
    "reflects all points across x-axis",
    (_) => {
      _.points = [Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 })];
      _.ReflectX();
      assert(
        _.points.matches([
          { x: -1, y: 2 },
          { x: -3, y: 4 },
        ])
      );
    },
  ],

  ReflectY: () => {
    _.points.forEach((p) => p.ReflectY());
    return _;
  },
  $test_ReflectY: [
    "reflects all points across y-axis",
    (_) => {
      _.points = [Point({ x: 1, y: 2 }), Point({ x: 3, y: 4 })];
      _.ReflectY();
      assert(
        _.points.matches([
          { x: 1, y: -2 },
          { x: 3, y: -4 },
        ])
      );
    },
  ],

  Rotate: (angle) => {
    _.points.forEach((p) => p.Rotate(angle));
    return _;
  },
  $test_Rotate: [
    "rotates all points",
    (_) => {
      _.points = [Point({ x: 1, y: 0 }), Point({ x: 0, y: 1 })];
      _.Rotate(90);
      assert(
        Math.abs(_.points[0].x) < 1e-10 && Math.abs(_.points[0].y - 1) < 1e-10
      );
      assert(
        Math.abs(_.points[1].x + 1) < 1e-10 && Math.abs(_.points[1].y) < 1e-10
      );
    },
  ],

  RotateAround: ({ x, y }, angle) => {
    _.points.forEach((p) => p.RotateAround({ x, y }, angle));
    return _;
  },
  $test_RotateAround: [
    "rotates all points around a point",
    (_) => {
      _.points = [Point({ x: 1, y: 0 }), Point({ x: 2, y: 0 })];
      _.RotateAround({ x: 0, y: 0 }, 90);
      assert(
        Math.abs(_.points[0].x) < 1e-10 && Math.abs(_.points[0].y - 1) < 1e-10
      );
      assert(
        Math.abs(_.points[1].x) < 1e-10 && Math.abs(_.points[1].y - 2) < 1e-10
      );
    },
  ],

  Translate: (dx, dy) => {
    _.points.forEach((p) => p.Translate(dx, dy));
    return _;
  },
  $test_Translate: [
    "translates all points",
    (_) => {
      _.points = [Point({ x: 1, y: 1 }), Point({ x: 2, y: 2 })];
      _.Translate(1, 2);
      assert(
        _.points.matches([
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ])
      );
    },
  ],

  TranslateX: (dx) => {
    _.points.forEach((p) => p.TranslateX(dx));
    return _;
  },
  $test_TranslateX: [
    "translates x of all points",
    (_) => {
      _.points = [Point({ x: 1, y: 1 }), Point({ x: 2, y: 2 })];
      _.TranslateX(2);
      assert(
        _.points.matches([
          { x: 3, y: 1 },
          { x: 4, y: 2 },
        ])
      );
    },
  ],

  TranslateY: (dy) => {
    _.points.forEach((p) => p.TranslateY(dy));
    return _;
  },
  $test_TranslateY: [
    "translates y of all points",
    (_) => {
      _.points = [Point({ x: 1, y: 1 }), Point({ x: 2, y: 2 })];
      _.TranslateY(2);
      assert(
        _.points.matches([
          { x: 1, y: 3 },
          { x: 2, y: 4 },
        ])
      );
    },
  ],

  Collapse: (x, y) => {
    _.points.forEach((p) => p.Move(x, y));
    return _;
  },
  $test_Collapse: [
    "collapses all points to a single point",
    (_) => {
      _.points = [
        Point({ x: 1, y: 1 }),
        Point({ x: 2, y: 2 }),
        Point({ x: 3, y: 3 }),
      ];
      _.Collapse(5, 5);
      assert(
        _.points.matches([
          { x: 5, y: 5 },
          { x: 5, y: 5 },
          { x: 5, y: 5 },
        ])
      );
    },
  ],

  CollapseX: (x) => {
    _.points.forEach((p) => p.MoveX(x));
    return _;
  },
  $test_CollapseX: [
    "collapses x of all points",
    (_) => {
      _.points = [
        Point({ x: 1, y: 1 }),
        Point({ x: 2, y: 2 }),
        Point({ x: 3, y: 3 }),
      ];
      _.CollapseX(5);
      assert(
        _.points.matches([
          { x: 5, y: 1 },
          { x: 5, y: 2 },
          { x: 5, y: 3 },
        ])
      );
    },
  ],

  CollapseY: (y) => {
    _.points.forEach((p) => p.MoveY(y));
    return _;
  },
  $test_CollapseY: [
    "collapses y of all points",
    (_) => {
      _.points = [
        Point({ x: 1, y: 1 }),
        Point({ x: 2, y: 2 }),
        Point({ x: 3, y: 3 }),
      ];

      _.CollapseY(5);

      assert(
        _.points.matches([
          { x: 1, y: 5 },
          { x: 2, y: 5 },
          { x: 3, y: 5 },
        ])
      );
    },
  ],
}));

window.Shape = Type(
  "Shape",
  (_) => ({
    $get_x: () => _.centroid.x,
    $get_y: () => _.centroid.y,
    $set_x: (x) => _.MoveX(x),
    $set_y: (y) => _.MoveY(y),
    $test_xy: [
      "returns centroid coordinates",
      (_) => {
        _.points = [Point({ x: 0, y: 0 }), Point({ x: 2, y: 2 })];
        assert(_.x === 1 && _.y === 1);
      },

      "moves shape to new x and y",
      (_) => {
        _.points = [Point({ x: 0, y: 0 }), Point({ x: 2, y: 2 })];
        _.x = 3;
        _.y = 4;
        assert(_.points[0].matches({ x: 2, y: 3 }));
        assert(_.points[1].matches({ x: 4, y: 5 }));
      },
    ],

    $get_isConcave: () => !_.isConvex,
    $test_isConcave: [
      "returns true for concave shapes",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 3, y: 0 }),
        ];
        assert(_.isConcave === true);
      },
      "returns false for convex shapes",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];
        assert(_.isConcave === false);
      },
    ],

    $get_top: () => Math.max(..._.points.map((p) => p.y)),
    $get_bottom: () => Math.min(..._.points.map((p) => p.y)),
    $get_left: () => Math.min(..._.points.map((p) => p.x)),
    $get_right: () => Math.max(..._.points.map((p) => p.x)),
    $test_bounding_values: [
      "returns correct bounding values",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 3 }),
          Point({ x: 1, y: 1 }),
        ];
        assert(_.top === 3);
        assert(_.bottom === 0);
        assert(_.left === 0);
        assert(_.right === 2);
      },
    ],

    $get_topLeftPoint: () => Point({ x: _.left, y: _.top }),
    $get_topRightPoint: () => Point({ x: _.right, y: _.top }),
    $get_bottomLeftPoint: () => Point({ x: _.left, y: _.bottom }),
    $get_bottomRightPoint: () => Point({ x: _.right, y: _.bottom }),
    $test_corner_points: [
      "returns correct corner points",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 3 }),
          Point({ x: 1, y: 1 }),
        ];
        assert(_.topLeftPoint.matches({ x: 0, y: 3 }));
        assert(_.topRightPoint.matches({ x: 2, y: 3 }));
        assert(_.bottomLeftPoint.matches({ x: 0, y: 0 }));
        assert(_.bottomRightPoint.matches({ x: 2, y: 0 }));
      },
    ],

    $get_boundingBox: () => {
      return {
        minX: _.left,
        minY: _.bottom,
        maxX: _.right,
        maxY: _.top,
      };
    },
    $test_boundingBox: [
      "returns correct bounding box",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 3 }),
          Point({ x: 1, y: 1 }),
        ];
        assert(
          _.boundingBox.matches({
            minX: 0,
            minY: 0,
            maxX: 2,
            maxY: 3,
          })
        );
      },
    ],

    $get_boundingCircle: () => {
      const getCircumcircle = (p1, p2, p3) => {
        const A = p2.x - p1.x;
        const B = p2.y - p1.y;
        const C = p3.x - p1.x;
        const D = p3.y - p1.y;
        const E = A * (p1.x + p2.x) + B * (p1.y + p2.y);
        const F = C * (p1.x + p3.x) + D * (p1.y + p3.y);
        const G = 2 * (A * (p3.y - p2.y) - B * (p3.x - p2.x));
        if (Math.abs(G) < 1e-10) return null;
        const cx = (D * E - B * F) / G;
        const cy = (A * F - C * E) / G;
        const radius = Math.sqrt((p1.x - cx) ** 2 + (p1.y - cy) ** 2);
        return { center: Point({ x: cx, y: cy }), radius };
      };

      if (_.points.length < 2) return { center: _.points[0], radius: 0 };
      if (_.points.length === 2) {
        const center = _.points[0].Midpoint(_.points[1]);
        const radius = _.points[0].Distance(center);
        return { center, radius };
      }

      let circle = getCircumcircle(_.points[0], _.points[1], _.points[2]);
      for (let i = 3; i < _.points.length; i++) {
        if (circle && _.points[i].Distance(circle.center) <= circle.radius)
          continue;
        for (let j = 0; j < i; j++) {
          for (let k = j + 1; k < i; k++) {
            circle = getCircumcircle(_.points[i], _.points[j], _.points[k]);
            if (circle) {
              let allPointsInside = true;
              for (let l = 0; l < _.points.length; l++) {
                if (
                  _.points[l].Distance(circle.center) >
                  circle.radius + 1e-10
                ) {
                  allPointsInside = false;
                  break;
                }
              }
              if (allPointsInside) return circle;
            }
          }
        }
      }
      return circle;
    },
    $test_boundingCircle: [
      "returns correct bounding circle for triangle",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: 1 }),
        ];
        const circle = _.boundingCircle;
        assert(Math.abs(circle.center.x - 0.5) < 1e-10);
        assert(Math.abs(circle.center.y - 0.5) < 1e-10);
        assert(Math.abs(circle.radius - Math.sqrt(0.5)) < 1e-10);
      },
      "returns correct bounding circle for square",
      (_) => {
        _.points = [
          Point({ x: -1, y: -1 }),
          Point({ x: 1, y: -1 }),
          Point({ x: 1, y: 1 }),
          Point({ x: -1, y: 1 }),
        ];
        const circle = _.boundingCircle;
        assert(Math.abs(circle.center.x) < 1e-10);
        assert(Math.abs(circle.center.y) < 1e-10);
        assert(Math.abs(circle.radius - Math.sqrt(2)) < 1e-10);
      },
    ],

    $get_centroid: () => {
      const n = _.points.length;
      const { sumX, sumY } = _.points.reduce(
        (acc, p) => ({
          sumX: acc.sumX + p.x,
          sumY: acc.sumY + p.y,
        }),
        { sumX: 0, sumY: 0 }
      );
      return Point({ x: sumX / n, y: sumY / n });
    },
    $test_centroid: [
      "returns correct centroid",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 3 }),
        ];
        assert(_.centroid.matches({ x: 1, y: 1 }));
      },
    ],

    $get_centerPoint: () => {
      const bbox = _.boundingBox;
      return Point({
        x: (bbox.minX + bbox.maxX) / 2,
        y: (bbox.minY + bbox.maxY) / 2,
      });
    },
    $test_centerPoint: [
      "returns correct center point",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 3 }),
        ];
        assert(_.centerPoint.matches({ x: 1, y: 1.5 }));
      },
    ],

    $get_area: () => {
      let area = 0;
      const n = _.points.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += _.points[i].x * _.points[j].y;
        area -= _.points[j].x * _.points[i].y;
      }
      return Math.abs(area / 2);
    },
    $test_area: [
      "returns correct area for triangle",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 3 }),
        ];
        assert(Math.abs(_.area - 3) < 1e-10);
      },
      "returns correct area for square",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];
        assert(Math.abs(_.area - 4) < 1e-10);
      },
    ],

    $get_perimeter: () => {
      let perimeter = 0;
      const n = _.points.length;
      for (let i = 0; i < n; i++) {
        perimeter += _.points[i].Distance(_.points[(i + 1) % n]);
      }
      return perimeter;
    },
    $test_perimeter: [
      "returns correct perimeter",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 0, y: 4 }),
        ];
        assert(Math.abs(_.perimeter - (3 + 4 + 5)) < 1e-10);
      },
    ],

    $get_length: () => {
      let length = 0;
      const n = _.points.length;
      for (let i = 0; i < n - 1; i++) {
        length += _.points[i].Distance(_.points[(i + 1) % n]);
      }
      return length;
    },
    $test_length: [
      "returns correct length",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 4 }),
        ];

        assert(Math.abs(_.length === 7));
      },
    ],

    $get_isConvex: () => {
      const n = _.points.length;
      if (n < 4) return true; // A triangle or less is always convex, groovy!

      let sign = null;
      for (let i = 0; i < n; i++) {
        const p1 = _.points[i];
        const p2 = _.points[(i + 1) % n];
        const p3 = _.points[(i + 2) % n];

        const cross =
          (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);

        if (cross !== 0) {
          if (sign === null) {
            sign = cross > 0;
          } else if (cross > 0 !== sign) {
            return false;
          }
        }
      }
      return true;
    },
    $test_isConvex: [
      "returns true for convex shapes",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];
        assert(_.isConvex === true);
      },
      "returns false for concave shapes",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 3, y: 0 }),
        ];
        assert(_.isConvex === false);
      },
    ],

    $get_width: () => {
      const bbox = _.boundingBox;
      return bbox.maxX - bbox.minX;
    },
    $get_height: () => {
      const bbox = _.boundingBox;
      return bbox.maxY - bbox.minY;
    },
    $test_width_height: [
      "returns correct width and height",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 4 }),
          Point({ x: 0, y: 4 }),
        ];
        assert(_.width === 3);
        assert(_.height === 4);
      },
    ],

    $get_diagonal: () => {
      const width = _.width;
      const height = _.height;
      return Math.sqrt(width ** 2 + height ** 2);
    },
    $test_diagonal: [
      "returns correct diagonal length",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 4 }),
          Point({ x: 0, y: 4 }),
        ];
        assert(Math.abs(_.diagonal - 5) < 1e-10);
      },
    ],

    $get_radius: () => {
      return _.boundingCircle.radius;
    },
    $test_radius: [
      "returns correct radius",
      (_) => {
        _.points = [
          Point({ x: -1, y: -1 }),
          Point({ x: 1, y: -1 }),
          Point({ x: 1, y: 1 }),
          Point({ x: -1, y: 1 }),
        ];
        assert(Math.abs(_.radius - Math.sqrt(2)) < 1e-10);
      },
    ],

    $get_circumference: () => {
      return 2 * Math.PI * _.radius;
    },
    $test_circumference: [
      "returns correct circumference",
      (_) => {
        _.points = [
          Point({ x: -1, y: -1 }),
          Point({ x: 1, y: -1 }),
          Point({ x: 1, y: 1 }),
          Point({ x: -1, y: 1 }),
        ];
        assert(Math.abs(_.circumference - 2 * Math.PI * Math.sqrt(2)) < 1e-10);
      },
    ],

    $get_diameter: () => {
      return 2 * _.radius;
    },
    $test_diameter: [
      "returns correct diameter",
      (_) => {
        _.points = [
          Point({ x: -1, y: -1 }),
          Point({ x: 1, y: -1 }),
          Point({ x: 1, y: 1 }),
          Point({ x: -1, y: 1 }),
        ];
        assert(Math.abs(_.diameter - 2 * Math.sqrt(2)) < 1e-10);
      },
    ],

    $get_aspectRatio: () => {
      const width = _.width;
      const height = _.height;
      return width / height;
    },
    $test_aspectRatio: [
      "returns correct aspect ratio",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 4 }),
          Point({ x: 0, y: 4 }),
        ];
        assert(Math.abs(_.aspectRatio - 0.75) < 1e-10);
      },
    ],

    $get_isSquare: () => {
      return Math.abs(_.width - _.height) < 1e-10;
    },
    $test_isSquare: [
      "returns true for square shapes",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];
        assert(_.isSquare === true);
      },
      "returns false for non-square shapes",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 4 }),
          Point({ x: 0, y: 4 }),
        ];
        assert(_.isSquare === false);
      },
    ],

    $get_isRegularPolygon: () => {
      if (_.points.length < 3) return false;
      const sideLengths = _.points.map((p, i) =>
        p.Distance(_.points[(i + 1) % _.points.length])
      );
      const firstLength = sideLengths[0];
      return sideLengths.every(
        (length) => Math.abs(length - firstLength) < 1e-10
      );
    },
    $test_isRegularPolygon: [
      "returns true for regular polygons",
      (_) => {
        _.points = [
          Point({ x: 1, y: 0 }),
          Point({ x: 0.5, y: Math.sqrt(3) / 2 }),
          Point({ x: -0.5, y: Math.sqrt(3) / 2 }),
          Point({ x: -1, y: 0 }),
          Point({ x: -0.5, y: -Math.sqrt(3) / 2 }),
          Point({ x: 0.5, y: -Math.sqrt(3) / 2 }),
        ];
        assert(_.isRegularPolygon === true);
      },
      "returns false for non-regular polygons",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 1 }),
        ];
        assert(_.isRegularPolygon === false);
      },
    ],

    $get_apothem: () => {
      if (!_.isRegularPolygon) return null;
      const s = _.points[0].Distance(_.points[1]); // Side length
      const n = _.points.length;
      return s / (2 * Math.tan(Math.PI / n));
    },
    $test_apothem: [
      "returns correct apothem for regular polygons",
      (_) => {
        _.points = [
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        assert(Math.abs(_.apothem - Math.sqrt(2) / 2) < 1e-10);
      },
      "returns null for non-regular polygons",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 1 }),
        ];
        assert(_.apothem === null);
      },
    ],

    $get_edges: () => {
      const edges = [];
      const n = _.points.length;
      for (let i = 0; i < n; i++) {
        const p1 = _.points[i];
        const p2 = _.points[(i + 1) % n];
        edges.push(Shape({ points: [p1, p2] }));
      }
      return edges;
    },
    $test_edges: [
      "returns correct edges",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];

        const edges = _.edges;
        assert(edges.length === 4);
        assert(
          edges[0].points.matches([
            { x: 0, y: 0 },
            { x: 2, y: 0 },
          ])
        );
        assert(
          edges[1].points.matches([
            { x: 2, y: 0 },
            { x: 2, y: 2 },
          ])
        );
        assert(
          edges[2].points.matches([
            { x: 2, y: 2 },
            { x: 0, y: 2 },
          ])
        );
        assert(
          edges[3].points.matches([
            { x: 0, y: 2 },
            { x: 0, y: 0 },
          ])
        );
      },
    ],

    $get_convexHull: () => {
      const points = _.points.map((p) => ({ x: p.x, y: p.y }));
      points.sort((a, b) => a.x - b.x || a.y - b.y);

      const cross = (o, a, b) =>
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

      const hull = [];

      for (let i = 0; i < points.length; i++) {
        while (
          hull.length >= 2 &&
          cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0
        ) {
          hull.pop();
        }
        hull.push(points[i]);
      }

      const t = hull.length + 1;
      for (let i = points.length - 2; i >= 0; i--) {
        while (
          hull.length >= t &&
          cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0
        ) {
          hull.pop();
        }
        hull.push(points[i]);
      }

      hull.pop();

      return Shape({ points: hull });
    },
    $test_convexHull: [
      "returns correct convex hull",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 3, y: 1 }),
        ];
        const hull = _.convexHull;
        assert(hull.points.length === 4, "Convex hull should have 4 points");
        assert(hull.points[0].matches({ x: 0, y: 0 }));
        assert(hull.points[1].matches({ x: 2, y: 0 }));
        assert(hull.points[2].matches({ x: 3, y: 1 }));
        assert(hull.points[3].matches({ x: 2, y: 2 }));
      },

      "handles collinear points correctly",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 3, y: 3 }),
          Point({ x: 0, y: 3 }),
          Point({ x: 3, y: 0 }),
        ];
        const hull = _.convexHull;
        assert(hull.points.length === 4, "Convex hull should have 4 points");
        assert(hull.points[0].matches({ x: 0, y: 0 }));
        assert(hull.points[1].matches({ x: 3, y: 0 }));
        assert(hull.points[2].matches({ x: 3, y: 3 }));
        assert(hull.points[3].matches({ x: 0, y: 3 }));
      },
    ],

    IsTouching: (otherShape) => {
      // Bounding Box Check
      const bbox1 = _.boundingBox;
      const bbox2 = otherShape.boundingBox;
      if (
        bbox1.maxX < bbox2.minX ||
        bbox1.minX > bbox2.maxX ||
        bbox1.maxY < bbox2.minY ||
        bbox1.minY > bbox2.maxY
      )
        return false;

      // Point-in-Polygon Check
      for (let p of _.points) {
        if (otherShape.ContainsPoint(p)) return true;
      }
      for (let p of otherShape.points) {
        if (_.ContainsPoint(p)) return true;
      }

      // Edge Intersection Check
      if (_.IntersectsWith(otherShape)) return true;

      return false;
    },
    $test_IsTouching: [
      "returns true for touching shapes",
      (_) => {
        const shape1 = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 2, y: 0 }),
            Point({ x: 2, y: 2 }),
            Point({ x: 0, y: 2 }),
          ],
        });
        const shape2 = Shape({
          points: [
            Point({ x: 2, y: 1 }),
            Point({ x: 4, y: 1 }),
            Point({ x: 3, y: 3 }),
          ],
        });
        assert(shape1.IsTouching(shape2) === true);
      },
      "returns false for non-touching shapes",
      (_) => {
        const shape1 = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 2, y: 0 }),
            Point({ x: 2, y: 2 }),
            Point({ x: 0, y: 2 }),
          ],
        });
        const shape2 = Shape({
          points: [
            Point({ x: 3, y: 3 }),
            Point({ x: 5, y: 3 }),
            Point({ x: 4, y: 5 }),
          ],
        });
        assert(shape1.IsTouching(shape2) === false);
      },
    ],

    SubdivideIntoRectangles: (rows, cols) => {
      const rectangles = [];
      const width = _.width;
      const height = _.height;
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = _.left + cellWidth * j + cellWidth / 2;
          const y = _.top - cellHeight * (i + 1) - cellHeight / 2;

          rectangles.push(
            Shape.Rectangle(cellWidth, cellHeight, Point({ x, y }))
          );
        }
      }

      return rectangles;
    },
    $test_SubdivideIntoRectangles: [
      "subdivides shape into correct number of rectangles",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 4, y: 0 }),
          Point({ x: 4, y: 4 }),
          Point({ x: 0, y: 4 }),
        ];
        const subdivided = _.SubdivideIntoRectangles(2, 2);
        assert(subdivided.length === 4);
        assert(subdivided[0].centerPoint.matches({ x: 1, y: 1 }));
      },
    ],

    SubdivideIntoTriangles: (divisions) => {
      const triangles = [];
      const width = _.width;
      const height = _.height;
      const rows = Math.floor(Math.sqrt(divisions));
      const cols = Math.ceil(divisions / rows);
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x1 = _.left + cellWidth * j;
          const y1 = _.top - cellHeight * i;
          const x2 = x1 + cellWidth;
          const y2 = y1 - cellHeight;
          triangles.push(
            Shape({
              points: [
                Point({ x: x1, y: y1 }),
                Point({ x: x2, y: y1 }),
                Point({ x: x1, y: y2 }),
              ],
            }),
            Shape({
              points: [
                Point({ x: x2, y: y1 }),
                Point({ x: x2, y: y2 }),
                Point({ x: x1, y: y2 }),
              ],
            })
          );
        }
      }

      return triangles;
    },
    $test_SubdivideIntoTriangles: [
      "subdivides shape into correct number of triangles",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 4, y: 0 }),
          Point({ x: 4, y: 4 }),
          Point({ x: 0, y: 4 }),
        ];
        const subdivided = _.SubdivideIntoTriangles(4);
        assert(subdivided.length === 8);
        assert(
          subdivided[0].points.matches([
            { x: 0, y: 4 },
            { x: 2, y: 4 },
            { x: 0, y: 2 },
          ])
        );
      },
    ],

    Move: (x, y) => {
      const center = _.centerPoint;
      const dx = x - center.x;
      const dy = y - center.y;

      _.points.forEach((p) => p.Move(p.x + dx, p.y + dy));
      return _;
    },
    $test_Move: [
      "moves shape to new position",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        _.Move(3, 3);
        assert(_.points[0].matches({ x: 2, y: 2 }));
        assert(_.points[1].matches({ x: 4, y: 2 }));
        assert(_.points[2].matches({ x: 3, y: 4 }));
      },
    ],

    MoveX: (x) => {
      const dx = x - _.centerPoint.x;
      _.points.forEach((p) => p.MoveX(p.x + dx));
      return _;
    },
    $test_MoveX: [
      "moves shape horizontally",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        _.MoveX(3);
        assert(_.points[0].matches({ x: 2, y: 0 }));
        assert(_.points[1].matches({ x: 4, y: 0 }));
        assert(_.points[2].matches({ x: 3, y: 2 }));
      },
    ],

    MoveY: (y) => {
      const dy = y - _.centerPoint.y;
      _.points.forEach((p) => p.MoveY(p.y + dy));
      return _;
    },
    $test_MoveY: [
      "moves shape vertically",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        _.MoveY(3);
        assert(_.points[0].matches({ x: 0, y: 2 }));
        assert(_.points[1].matches({ x: 2, y: 2 }));
        assert(_.points[2].matches({ x: 1, y: 4 }));
      },
    ],

    ClosestPoint: (point) => {
      let closestPoint = _.points[0];
      let minDistance = closestPoint.Distance(point);
      _.points.forEach((p) => {
        const distance = p.Distance(point);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = p;
        }
      });
      return closestPoint;
    },
    $test_ClosestPoint: [
      "returns the closest point to given point",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        const closest = _.ClosestPoint(Point({ x: 0.5, y: 0.5 }));
        assert(closest.matches({ x: 0, y: 0 }));
      },
    ],

    FarthestPoint: (point) => {
      let farthestPoint = _.points[0];
      let maxDistance = farthestPoint.Distance(point);
      _.points.forEach((p) => {
        const distance = p.Distance(point);
        if (distance > maxDistance) {
          maxDistance = distance;
          farthestPoint = p;
        }
      });
      return farthestPoint;
    },
    $test_FarthestPoint: [
      "returns the farthest point from given point",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        const farthest = _.FarthestPoint(Point({ x: 0, y: 0 }));
        assert(farthest.matches({ x: 1, y: 2 }));
      },
    ],

    ContainsPoint: (point) => {
      const { x, y } = point;
      if (_.points.find((p) => p.x === x && p.y === y)) return true;

      let isInside = false;
      const n = _.points.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = _.points[i].x,
          yi = _.points[i].y;
        const xj = _.points[j].x,
          yj = _.points[j].y;

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) isInside = !isInside;
      }
      return isInside;
    },
    $test_ContainsPoint: [
      "returns true for points inside the shape",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        assert(_.ContainsPoint(Point({ x: 1, y: 0.5 })) === true);
      },
      "returns true for points in .points",
      (_) => {
        _.points = [Point({ x: 0, y: 0 })];
        assert(_.ContainsPoint(Point({ x: 0, y: 0 })) === true);
      },
      "returns false for points outside the shape",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 1, y: 2 }),
        ];
        assert(_.ContainsPoint(Point({ x: 2, y: 2 })) === false);
      },
    ],

    IntersectsWith: (otherShape) => {
      const linesIntersect = (p1, p2, q1, q2) => {
        const orientation = (a, b, c) => {
          const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
          if (Math.abs(val) < 1e-10) return 0; // collinear
          return val > 0 ? 1 : 2; // clock or counterclock wise
        };
        const o1 = orientation(p1, p2, q1);
        const o2 = orientation(p1, p2, q2);
        const o3 = orientation(q1, q2, p1);
        const o4 = orientation(q1, q2, p2);
        if (o1 !== o2 && o3 !== o4) return true;
        return false;
      };

      const n1 = _.points.length;
      const n2 = otherShape.points.length;
      for (let i = 0; i < n1; i++) {
        const p1 = _.points[i];
        const p2 = _.points[(i + 1) % n1];
        for (let j = 0; j < n2; j++) {
          const q1 = otherShape.points[j];
          const q2 = otherShape.points[(j + 1) % n2];
          if (linesIntersect(p1, p2, q1, q2)) return true;
        }
      }
      return false;
    },
    $test_IntersectsWith: [
      "returns true for intersecting shapes",
      (_) => {
        const shape1 = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 2, y: 0 }),
            Point({ x: 1, y: 2 }),
          ],
        });
        const shape2 = Shape({
          points: [
            Point({ x: 1, y: 1 }),
            Point({ x: 3, y: 1 }),
            Point({ x: 2, y: 3 }),
          ],
        });
        assert(shape1.IntersectsWith(shape2) === true);
      },
      "returns false for non-intersecting shapes",
      (_) => {
        const shape1 = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 2, y: 0 }),
            Point({ x: 1, y: 2 }),
          ],
        });
        const shape2 = Shape({
          points: [
            Point({ x: 3, y: 3 }),
            Point({ x: 5, y: 3 }),
            Point({ x: 4, y: 5 }),
          ],
        });
        assert(shape1.IntersectsWith(shape2) === false);
      },
    ],

    DistanceTo: (otherShape) => {
      const [left1, right1, top1, bottom1] = [_.left, _.right, _.top, _.bottom];
      const [left2, right2, top2, bottom2] = [
        otherShape.left,
        otherShape.right,
        otherShape.top,
        otherShape.bottom,
      ];

      const xOverlap = Math.max(
        0,
        Math.min(right1, right2) - Math.max(left1, left2)
      );
      const yOverlap = Math.max(
        0,
        Math.min(top1, top2) - Math.max(bottom1, bottom2)
      );

      if (xOverlap > 0 && yOverlap > 0) {
        return 0; // Shapes are overlapping
      }

      if (xOverlap > 0) {
        return Math.min(Math.abs(top1 - bottom2), Math.abs(top2 - bottom1));
      }

      if (yOverlap > 0) {
        return Math.min(Math.abs(right1 - left2), Math.abs(right2 - left1));
      }

      // No overlap, find the distance between closest corners
      const dx = Math.min(Math.abs(right1 - left2), Math.abs(right2 - left1));
      const dy = Math.min(Math.abs(top1 - bottom2), Math.abs(top2 - bottom1));
      return Math.sqrt(dx * dx + dy * dy);
    },
    $test_DistanceTo: [
      "returns correct distance between non-overlapping rectangles",
      (_) => {
        // Create two 2x2 squares that are exactly 4 units apart
        const shape1 = Shape.Rectangle(2, 2, Point({ x: 0, y: 0 }));
        const shape2 = Shape.Rectangle(2, 2, Point({ x: 5, y: 0 }));

        const distance = shape1.DistanceTo(shape2);
        console.log("Calculated distance:", distance);

        assert(
          Math.abs(distance - 3) < 1e-10,
          `Distance ${distance} should be 3 (with a small margin for floating-point precision)`
        );
      },

      "returns zero for overlapping shapes",
      (_) => {
        const shape1 = Shape.Rectangle(2, 2, Point({ x: 0, y: 0 }));
        const shape2 = Shape.Rectangle(2, 2, Point({ x: 1, y: 1 }));

        const distance = shape1.DistanceTo(shape2);
        console.log("Calculated distance for overlapping shapes:", distance);

        assert(
          distance === 0,
          `Distance ${distance} should be 0 for overlapping shapes`
        );
      },

      "calculates diagonal distance correctly",
      (_) => {
        const shape1 = Shape.Rectangle(2, 2, Point({ x: 0, y: 0 }));
        const shape2 = Shape.Rectangle(2, 2, Point({ x: 3, y: 4 }));

        const distance = shape1.DistanceTo(shape2);

        const expectedDistance = Math.sqrt(5); // ≈ 2.236
        assert(
          Math.abs(distance - expectedDistance) < 1e-10,
          `Distance ${distance} should be close to ${expectedDistance} (with a small margin for floating-point precision)`
        );
      },
    ],

    IsContainedWithin: (otherShape) => {
      return _.points.every((p) => otherShape.ContainsPoint(p));
    },
    $test_IsContainedWithin: [
      "returns true when shape is contained within another",
      (_) => {
        const innerShape = Shape({
          points: [
            Point({ x: 1, y: 1 }),
            Point({ x: 2, y: 1 }),
            Point({ x: 1.5, y: 2 }),
          ],
        });
        const outerShape = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 3, y: 0 }),
            Point({ x: 3, y: 3 }),
            Point({ x: 0, y: 3 }),
          ],
        });
        assert(innerShape.IsContainedWithin(outerShape) === true);
      },
      "returns false when shape is not contained within another",
      (_) => {
        const shape1 = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 2, y: 0 }),
            Point({ x: 1, y: 2 }),
          ],
        });
        const shape2 = Shape({
          points: [
            Point({ x: 1, y: 1 }),
            Point({ x: 3, y: 1 }),
            Point({ x: 2, y: 3 }),
          ],
        });
        assert(shape1.IsContainedWithin(shape2) === false);
      },
    ],

    MinkowskiSum: (otherShape) => {
      const result = [];
      _.points.forEach((p1) => {
        otherShape.points.forEach((p2) => {
          result.push(Point({ x: p1.x + p2.x, y: p1.y + p2.y }));
        });
      });
      return Shape({ points: result });
    },
    $test_MinkowskiSum: [
      "returns correct Minkowski sum of two shapes",
      (_) => {
        const shape1 = Shape({
          points: [
            Point({ x: 0, y: 0 }),
            Point({ x: 1, y: 0 }),
            Point({ x: 0, y: 1 }),
          ],
        });
        const shape2 = Shape({
          points: [Point({ x: 0, y: 0 }), Point({ x: 1, y: 1 })],
        });
        const sum = shape1.MinkowskiSum(shape2);

        assert(sum.points.length === 6);
        assert(sum.ContainsPoint(Point({ x: 0, y: 0 })));
        assert(sum.ContainsPoint(Point({ x: 2, y: 1 })));
        assert(sum.ContainsPoint(Point({ x: 1, y: 2 })));
      },
    ],

    FindLineIntersection: (p1, p2, q1, q2) => {
      const dx1 = p2.x - p1.x;
      const dy1 = p2.y - p1.y;
      const dx2 = q2.x - q1.x;
      const dy2 = q2.y - q1.y;

      const determinant = dx1 * dy2 - dy1 * dx2;
      if (Math.abs(determinant) < 1e-10) return null; // Lines are parallel

      const t = ((q1.x - p1.x) * dy2 - (q1.y - p1.y) * dx2) / determinant;
      const u = ((q1.x - p1.x) * dy1 - (q1.y - p1.y) * dx1) / determinant;

      if (t < 0 || t > 1 || u < 0 || u > 1) return null; // Intersection point is outside line segments

      return Point({
        x: p1.x + t * dx1,
        y: p1.y + t * dy1,
      });
    },
    $test_FindLineIntersection: [
      "finds intersection point of two lines",
      (_) => {
        const p1 = Point({ x: 0, y: 0 });
        const p2 = Point({ x: 2, y: 2 });
        const q1 = Point({ x: 0, y: 2 });
        const q2 = Point({ x: 2, y: 0 });
        const intersection = _.FindLineIntersection(p1, p2, q1, q2);
        assert(intersection.matches({ x: 1, y: 1 }));
      },
      "returns null for parallel lines",
      (_) => {
        const p1 = Point({ x: 0, y: 0 });
        const p2 = Point({ x: 2, y: 2 });
        const q1 = Point({ x: 1, y: 1 });
        const q2 = Point({ x: 3, y: 3 });
        const intersection = _.FindLineIntersection(p1, p2, q1, q2);
        assert(intersection === null);
      },
      "returns null when intersection is outside line segments",
      (_) => {
        const p1 = Point({ x: 0, y: 0 });
        const p2 = Point({ x: 1, y: 1 });
        const q1 = Point({ x: 2, y: 2 });
        const q2 = Point({ x: 3, y: 3 });
        const intersection = _.FindLineIntersection(p1, p2, q1, q2);
        assert(intersection === null);
      },
    ],

    LineIntersections: () => {
      const intersections = [];
      const n = _.points.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
          // Skip adjacent edges
          if (i === 0 && j === n - 1) continue;

          const p1 = _.points[i];
          const p2 = _.points[(i + 1) % n];
          const q1 = _.points[j];
          const q2 = _.points[(j + 1) % n];

          const intersection = _.FindLineIntersection(p1, p2, q1, q2);
          if (intersection) {
            // Check if the intersection point is actually on both line segments
            if (
              _.IsPointOnLineSegment(intersection, p1, p2) &&
              _.IsPointOnLineSegment(intersection, q1, q2)
            ) {
              intersections.push(intersection);
            }
          }
        }
      }
      return intersections;
    },
    IsPointOnLineSegment: (p, start, end) => {
      const d1 = p.Distance(start);
      const d2 = p.Distance(end);
      const lineLength = start.Distance(end);
      const buffer = 1e-10; // Floating point precision buffer
      return Math.abs(d1 + d2 - lineLength) < buffer;
    },
    $test_LineIntersections: [
      "returns correct line intersections",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 0, y: 2 }),
        ];
        const intersections = _.LineIntersections();
        assert(intersections.length === 1);
        assert(intersections[0].matches({ x: 1, y: 1 }));
      },
    ],

    Smooth: () => {
      const smoothedPoints = [];
      const n = _.points.length;
      for (let i = 0; i < n; i++) {
        const p0 = _.points[(i - 1 + n) % n];
        const p1 = _.points[i];
        const p2 = _.points[(i + 1) % n];
        const smoothedPoint = Point({
          x: (p0.x + p1.x + p2.x) / 3,
          y: (p0.y + p1.y + p2.y) / 3,
        });
        smoothedPoints.push(smoothedPoint);
      }
      _.points = smoothedPoints;
      return _;
    },
    $test_Smooth: [
      "smooths the shape",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 3 }),
          Point({ x: 0, y: 3 }),
        ];
        _.Smooth();
        assert(_.points.length === 4);
        assert(_.points[0].matches({ x: 1, y: 1 }));
        assert(_.points[1].matches({ x: 2, y: 1 }));
        assert(_.points[2].matches({ x: 2, y: 2 }));
        assert(_.points[3].matches({ x: 1, y: 2 }));
      },
    ],

    Mirror: (axis) => {
      _.points = _.points.map((p) => {
        if (axis === "x") {
          return Point({ x: p.x, y: -p.y });
        } else if (axis === "y") {
          return Point({ x: -p.x, y: p.y });
        }
        return p; // If no valid axis is specified, return the original point
      });
      return _;
    },
    $test_Mirror: [
      "mirrors shape across x-axis",
      (_) => {
        _.points = [
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 3, y: 1 }),
        ];
        const result = _.Mirror("x");
        assert(result === _, "Mirror should return the shape itself");
        assert(_.points[0].matches({ x: 1, y: -1 }));
        assert(_.points[1].matches({ x: 2, y: -2 }));
        assert(_.points[2].matches({ x: 3, y: -1 }));
      },
      "mirrors shape across y-axis",
      (_) => {
        _.points = [
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 3, y: 1 }),
        ];
        const result = _.Mirror("y");
        assert(result === _, "Mirror should return the shape itself");
        assert(_.points[0].matches({ x: -1, y: 1 }));
        assert(_.points[1].matches({ x: -2, y: 2 }));
        assert(_.points[2].matches({ x: -3, y: 1 }));
      },
    ],

    GenerateRandomPoints: (numPoints) => {
      const bbox = _.boundingBox;
      const randomPoints = [];
      for (let i = 0; i < numPoints; i++) {
        const x = bbox.minX + Math.random() * (bbox.maxX - bbox.minX);
        const y = bbox.minY + Math.random() * (bbox.maxY - bbox.minY);
        randomPoints.push(Point({ x, y }));
      }
      return Shape({ points: randomPoints });
    },
    $test_GenerateRandomPoints: [
      "generates correct number of random points within bounding box",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];
        const randomShape = _.GenerateRandomPoints(5);
        assert(randomShape.points.length === 5);
        randomShape.points.forEach((p) => {
          assert(p.x >= 0 && p.x <= 2);
          assert(p.y >= 0 && p.y <= 2);
        });
      },
    ],

    Simplify: (epsilon = 1) => {
      const rdp = (points, epsilon) => {
        if (points.length <= 2) return points;

        let maxDistance = 0;
        let index = 0;
        const end = points.length - 1;

        for (let i = 1; i < end; i++) {
          const distance = perpendicularDistance(
            points[i],
            points[0],
            points[end]
          );
          if (distance > maxDistance) {
            maxDistance = distance;
            index = i;
          }
        }

        if (maxDistance > epsilon) {
          const results1 = rdp(points.slice(0, index + 1), epsilon);
          const results2 = rdp(points.slice(index), epsilon);
          return [...results1.slice(0, -1), ...results2];
        } else {
          return [points[0].Clone(), points[end].Clone()];
        }
      };

      const perpendicularDistance = (point, lineStart, lineEnd) => {
        const x0 = point.x;
        const y0 = point.y;
        const x1 = lineStart.x;
        const y1 = lineStart.y;
        const x2 = lineEnd.x;
        const y2 = lineEnd.y;

        const numerator = Math.abs(
          (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1
        );
        const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

        return numerator / denominator;
      };

      const newPoints = rdp(_.points, epsilon);
      _.points = newPoints;
      return _;
    },
    $test_Simplify: [
      "simplifies shape by removing unnecessary points",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 0.1 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 3, y: 0.1 }),
          Point({ x: 4, y: 0 }),
        ];
        const result = _.Simplify(0.2);
        assert(result === _, "Simplify should return the shape itself");
        assert(
          _.points.length === 2,
          `Expected 2 points, got ${_.points.length}`
        );
        assert(
          _.points[0].matches({ x: 0, y: 0 }),
          `First point should be (0,0), got (${_.points[0].x}, ${_.points[0].y})`
        );
        assert(
          _.points[1].matches({ x: 4, y: 0 }),
          `Last point should be (4,0), got (${_.points[1].x}, ${_.points[1].y})`
        );
      },

      "doesn't simplify shape when epsilon is too small",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 0 }),
        ];
        _.Simplify(0.1);
        assert(
          _.points.length === 3,
          `Expected 3 points, got ${_.points.length}`
        );
      },

      "handles shapes with two points",
      (_) => {
        _.points = [Point({ x: 0, y: 0 }), Point({ x: 1, y: 1 })];
        _.Simplify(1);
        assert(
          _.points.length === 2,
          `Expected 2 points, got ${_.points.length}`
        );
      },
    ],

    Triangulate: () => {
      const isClockwise = (points) => {
        let sum = 0;
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          sum += (p2.x - p1.x) * (p2.y + p1.y);
        }
        return sum > 0;
      };

      const isConvex = (p1, p2, p3) => {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
      };

      const isEar = (p1, p2, p3, points) => {
        if (!isConvex(p1, p2, p3)) return false;
        for (const point of points) {
          if (point === p1 || point === p2 || point === p3) continue;
          if (pointInTriangle(point, p1, p2, p3)) return false;
        }
        return true;
      };

      const pointInTriangle = (pt, v1, v2, v3) => {
        const d1 = sign(pt, v1, v2);
        const d2 = sign(pt, v2, v3);
        const d3 = sign(pt, v3, v1);
        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        return !(hasNeg && hasPos);
      };

      const sign = (p1, p2, p3) => {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
      };

      const points = _.points.slice();
      if (isClockwise(points)) points.reverse();
      const triangles = [];

      while (points.length > 3) {
        let earFound = false;
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const p3 = points[(i + 2) % points.length];
          if (isEar(p1, p2, p3, points)) {
            triangles.push(Shape({ points: [p1, p2, p3] }));
            points.splice((i + 1) % points.length, 1);
            earFound = true;
            break;
          }
        }
        if (!earFound) break; // Fallback to avoid infinite loop in case of non-simple polygon
      }

      if (points.length === 3) triangles.push(Shape({ points }));
      return triangles;
    },
    $test_Triangulate: [
      "triangulates a simple polygon",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 0, y: 2 }),
        ];
        const triangles = _.Triangulate();
        assert(triangles.length === 3);
        triangles.forEach((triangle) => {
          assert(triangle.points.length === 3);
        });
      },
    ],

    Pathfinding: (start, end) => {
      const heuristic = (a, b) =>
        Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

      const neighbors = (point) => {
        return _.points.filter(
          (p) =>
            p !== point &&
            _.edges.some(
              (edge) =>
                (edge.points[0].matches(point) && edge.points[1].matches(p)) ||
                (edge.points[1].matches(point) && edge.points[0].matches(p))
            )
        );
      };

      const startNode = _.points.find((p) => p.matches(start));
      const endNode = _.points.find((p) => p.matches(end));

      if (!startNode || !endNode) return null;

      const openSet = [startNode];
      const cameFrom = new Map();
      const gScore = new Map(_.points.map((p) => [p, Infinity]));
      const fScore = new Map(_.points.map((p) => [p, Infinity]));

      gScore.set(startNode, 0);
      fScore.set(startNode, heuristic(startNode, endNode));

      while (openSet.length > 0) {
        const current = openSet.reduce((a, b) =>
          fScore.get(a) < fScore.get(b) ? a : b
        );

        if (current.matches(endNode)) {
          const path = [];
          let temp = current;
          while (temp) {
            path.unshift(temp);
            temp = cameFrom.get(temp);
          }
          return path;
        }

        openSet.splice(openSet.indexOf(current), 1);
        for (const neighbor of neighbors(current)) {
          const tentativeGScore =
            gScore.get(current) + current.Distance(neighbor);
          if (tentativeGScore < gScore.get(neighbor)) {
            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeGScore);
            fScore.set(
              neighbor,
              gScore.get(neighbor) + heuristic(neighbor, endNode)
            );
            if (!openSet.some((p) => p.matches(neighbor)))
              openSet.push(neighbor);
          }
        }
      }

      return null;
    },

    $test_Pathfinding: [
      "finds a valid path between two points",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 0 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 0, y: 2 }),
        ];

        const path = _.Pathfinding(
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 2 })
        );

        assert(path !== null, "Expected a path to be found, but got null");
        assert(
          path.length >= 3,
          `Expected path length at least 3, got ${path.length}`
        );
        assert(
          path[0].matches({ x: 0, y: 0 }),
          `Expected first point (0,0), got (${path[0].x},${path[0].y})`
        );
        assert(
          path[path.length - 1].matches({ x: 2, y: 2 }),
          `Expected last point (2,2), got (${path[path.length - 1].x},${
            path[path.length - 1].y
          })`
        );

        // Check that each step in the path is valid
        for (let i = 1; i < path.length; i++) {
          const isValidStep = _.edges.some(
            (edge) =>
              (edge.points[0].matches(path[i - 1]) &&
                edge.points[1].matches(path[i])) ||
              (edge.points[1].matches(path[i - 1]) &&
                edge.points[0].matches(path[i]))
          );
          assert(
            isValidStep,
            `Invalid step from (${path[i - 1].x},${path[i - 1].y}) to (${
              path[i].x
            },${path[i].y})`
          );
        }
      },
      "returns null when no path exists",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 2 }),
        ];

        const path = _.Pathfinding(
          Point({ x: 0, y: 0 }),
          Point({ x: 2, y: 0 })
        );
        assert(path === null, "Expected null when no path exists");
      },
    ],

    ChordLength: (centerAngle) => {
      const radius = _.radius;
      return 2 * radius * Math.sin(centerAngle / 2);
    },
    $test_ChordLength: [
      "calculates correct chord length",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const chordLength = _.ChordLength(Math.PI / 2);
        assert(Math.abs(chordLength - Math.sqrt(2)) < 1e-10);
      },
    ],

    SectorArea: (centerAngle) => {
      const radius = _.radius;
      return 0.5 * radius * radius * centerAngle;
    },
    $test_SectorArea: [
      "calculates correct sector area",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const sectorArea = _.SectorArea(Math.PI / 2);
        assert(Math.abs(sectorArea - Math.PI / 4) < 1e-10);
      },
    ],

    ArcLength: (centerAngle) => {
      const radius = _.radius;
      return radius * centerAngle;
    },
    $test_ArcLength: [
      "calculates correct arc length",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const arcLength = _.ArcLength(Math.PI / 2);
        assert(Math.abs(arcLength - Math.PI / 2) < 1e-10);
      },
    ],

    SegmentArea: (centerAngle) => {
      const radius = _.radius;
      const chordLength = 2 * radius * Math.sin(centerAngle / 2);
      const height = radius * (1 - Math.cos(centerAngle / 2));
      const triangleArea = 0.5 * chordLength * (radius - height);
      const sectorArea = 0.5 * radius * radius * centerAngle;
      return sectorArea - triangleArea;
    },
    $test_SegmentArea: [
      "calculates correct segment area",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const segmentArea = _.SegmentArea(Math.PI / 2);
        const expectedArea = Math.PI / 4 - 1 / 2;
        assert(
          Math.abs(segmentArea - expectedArea) < 1e-10,
          `Expected area close to ${expectedArea}, but got ${segmentArea}`
        );
      },
    ],

    CircumscribedPolygon: (sides) => {
      const center = _.boundingCircle.center;
      const radius = _.radius;
      const angleIncrement = (2 * Math.PI) / sides;
      const points = [];

      for (let i = 0; i < sides; i++) {
        const angle = i * angleIncrement;
        points.push(
          Point({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          })
        );
      }

      return Shape({ points });
    },
    $test_CircumscribedPolygon: [
      "creates correct circumscribed polygon",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const hexagon = _.CircumscribedPolygon(6);
        assert(hexagon.points.length === 6);
        hexagon.points.forEach((p) => {
          assert(
            Math.abs(p.Distance(_.boundingCircle.center) - _.radius) < 1e-10
          );
        });
      },
    ],

    InscribedPolygon: (sides) => {
      const center = _.boundingCircle.center;
      const radius = _.radius * Math.cos(Math.PI / sides);
      const angleIncrement = (2 * Math.PI) / sides;
      const points = [];

      for (let i = 0; i < sides; i++) {
        const angle = i * angleIncrement;
        points.push(
          Point({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          })
        );
      }

      return Shape({ points });
    },
    $test_InscribedPolygon: [
      "creates correct inscribed polygon",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const hexagon = _.InscribedPolygon(6);
        assert(hexagon.points.length === 6);
        const expectedRadius = _.radius * Math.cos(Math.PI / 6);
        hexagon.points.forEach((p) => {
          assert(
            Math.abs(p.Distance(_.boundingCircle.center) - expectedRadius) <
              1e-10
          );
        });
      },
    ],

    Sector: (centerAngle) => {
      const center = _.boundingCircle.center;
      const radius = _.radius;
      const endAngle = centerAngle / 2;

      const p1 = Point({
        x: center.x + radius * Math.cos(-endAngle),
        y: center.y + radius * Math.sin(-endAngle),
      });
      const p2 = Point({
        x: center.x + radius * Math.cos(endAngle),
        y: center.y + radius * Math.sin(endAngle),
      });

      return Shape({ points: [center, p1, p2] });
    },
    $test_Sector: [
      "creates correct sector",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const sector = _.Sector(Math.PI / 2);
        assert(sector.points.length === 3);
        assert(sector.points[0].matches(_.boundingCircle.center));
        assert(
          Math.abs(
            sector.points[1].Distance(_.boundingCircle.center) - _.radius
          ) < 1e-10
        );
        assert(
          Math.abs(
            sector.points[2].Distance(_.boundingCircle.center) - _.radius
          ) < 1e-10
        );
      },
    ],

    Arc: (centerAngle) => {
      const center = _.boundingCircle.center;
      const radius = _.radius;
      const endAngle = centerAngle / 2;

      const p1 = Point({
        x: center.x + radius * Math.cos(-endAngle),
        y: center.y + radius * Math.sin(-endAngle),
      });
      const p2 = Point({
        x: center.x + radius * Math.cos(endAngle),
        y: center.y + radius * Math.sin(endAngle),
      });

      return Shape({ points: [p1, p2] });
    },
    $test_Arc: [
      "creates correct arc",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const arc = _.Arc(Math.PI / 2);
        assert(arc.points.length === 2);
        assert(
          Math.abs(arc.points[0].Distance(_.boundingCircle.center) - _.radius) <
            1e-10
        );
        assert(
          Math.abs(arc.points[1].Distance(_.boundingCircle.center) - _.radius) <
            1e-10
        );
      },
    ],

    Chord: (centerAngle) => {
      const center = _.boundingCircle.center;
      const radius = _.radius;
      const endAngle = centerAngle / 2;

      const p1 = Point({
        x: center.x + radius * Math.cos(-endAngle),
        y: center.y + radius * Math.sin(-endAngle),
      });
      const p2 = Point({
        x: center.x + radius * Math.cos(endAngle),
        y: center.y + radius * Math.sin(endAngle),
      });

      return Shape({ points: [p1, p2] });
    },
    $test_Chord: [
      "creates correct chord",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const chord = _.Chord(Math.PI / 2);
        assert(chord.points.length === 2);
        assert(
          Math.abs(
            chord.points[0].Distance(_.boundingCircle.center) - _.radius
          ) < 1e-10
        );
        assert(
          Math.abs(
            chord.points[1].Distance(_.boundingCircle.center) - _.radius
          ) < 1e-10
        );
        assert(
          Math.abs(chord.points[0].Distance(chord.points[1]) - Math.sqrt(2)) <
            1e-10
        );
      },
    ],

    Segment: (centerAngle) => {
      const center = _.boundingCircle.center;
      const radius = _.radius;
      const endAngle = centerAngle / 2;

      const p1 = Point({
        x: center.x + radius * Math.cos(-endAngle),
        y: center.y + radius * Math.sin(-endAngle),
      });
      const p2 = Point({
        x: center.x + radius * Math.cos(endAngle),
        y: center.y + radius * Math.sin(endAngle),
      });

      return Shape({ points: [center, p1, p2] });
    },
    $test_Segment: [
      "creates correct segment",
      (_) => {
        _.points = [
          Point({ x: -1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: -1 }),
        ];
        const segment = _.Segment(Math.PI / 2);
        assert(segment.points.length === 3);
        assert(segment.points[0].matches(_.boundingCircle.center));
        assert(
          Math.abs(
            segment.points[1].Distance(_.boundingCircle.center) - _.radius
          ) < 1e-10
        );
        assert(
          Math.abs(
            segment.points[2].Distance(_.boundingCircle.center) - _.radius
          ) < 1e-10
        );
        assert(
          Math.abs(
            segment.points[1].Distance(segment.points[2]) - Math.sqrt(2)
          ) < 1e-10
        );
      },
    ],

    // STATIC

    $static_FromPoints: (...points) => Shape({ points }),
    $test_FromPoints: [
      "works",
      () => {
        const shape = Shape.FromPoints(Point({ x: 0, y: 2 }));
        assert(shape.points.length === 1);
        assert(shape.points[0].matches({ x: 0, y: 2 }));
      },
    ],

    $static_Rectangle: (width, height, centerPoint = Point({ x: 0, y: 0 })) => {
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      return Shape({
        points: [
          Point({
            x: centerPoint.x - halfWidth,
            y: centerPoint.y + halfHeight,
          }),
          Point({
            x: centerPoint.x + halfWidth,
            y: centerPoint.y + halfHeight,
          }),
          Point({
            x: centerPoint.x + halfWidth,
            y: centerPoint.y - halfHeight,
          }),
          Point({
            x: centerPoint.x - halfWidth,
            y: centerPoint.y - halfHeight,
          }),
        ],
      });
    },
    $test_Rectangle: [
      "creates a rectangle with correct dimensions and centerPoint",
      () => {
        const rect = Shape.Rectangle(4, 2, Point({ x: 1, y: 1 }));
        assert(rect.points.length === 4, "Rectangle should have 4 points");
        assert(rect.width === 4, "Rectangle width should be 4");
        assert(rect.height === 2, "Rectangle height should be 2");
        assert(
          rect.centerPoint.matches({ x: 1, y: 1 }),
          "Rectangle centerPoint should be (1,1)"
        );
      },
    ],

    $static_Square: (size, centerPoint = Point({ x: 0, y: 0 })) => {
      return Shape.Rectangle(size, size, centerPoint);
    },
    $test_Square: [
      "creates a square with correct size and centerPoint",
      () => {
        const square = Shape.Square(3, Point({ x: -1, y: -1 }));
        assert(square.points.length === 4, "Square should have 4 points");
        assert(square.width === 3, "Square width should be 3");
        assert(square.height === 3, "Square height should be 3");
        assert(
          square.centerPoint.matches({ x: -1, y: -1 }),
          "Square centerPoint should be (-1,-1)"
        );
      },
    ],

    $static_Circle: (
      radius,
      centerPoint = Point({ x: 0, y: 0 }),
      segments = 32
    ) => {
      const points = [];
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        points.push(
          Point({
            x: centerPoint.x + radius * Math.cos(angle),
            y: centerPoint.y + radius * Math.sin(angle),
          })
        );
      }
      return Shape({ points });
    },
    $test_Circle: [
      "creates a circle with correct radius and centerPoint",
      () => {
        const circle = Shape.Circle(5, Point({ x: 2, y: 2 }), 16);
        assert(circle.points.length === 16, "Circle should have 16 points");
        assert(
          Math.abs(circle.width - 10) < 0.1,
          "Circle width should be close to 10"
        );
        assert(
          Math.abs(circle.height - 10) < 0.1,
          "Circle height should be close to 10"
        );
        assert(
          circle.centerPoint.matches({ x: 2, y: 2 }),
          "Circle centerPoint should be (2,2)"
        );
      },
    ],

    $static_Triangle: (base, height, centerPoint = Point({ x: 0, y: 0 })) => {
      const halfBase = base / 2;
      return Shape({
        points: [
          Point({ x: centerPoint.x, y: centerPoint.y + height / 2 }),
          Point({ x: centerPoint.x - halfBase, y: centerPoint.y - height / 2 }),
          Point({ x: centerPoint.x + halfBase, y: centerPoint.y - height / 2 }),
        ],
      });
    },
    $test_Triangle: [
      "creates a triangle with correct base, height, and centerPoint",
      () => {
        const triangle = Shape.Triangle(6, 4, Point({ x: 1, y: 1 }));
        assert(triangle.points.length === 3, "Triangle should have 3 points");
        assert(triangle.width === 6, "Triangle width should be 6");
        assert(triangle.height === 4, "Triangle height should be 4");
        assert(
          triangle.centerPoint.matches({ x: 1, y: 1 }),
          "Triangle centerPoint should be (1,1)"
        );
      },
    ],
  }),
  Points
);

window.BezierShape = Type(
  "BezierShape",
  (_) => ({
    $get_controlPoints: () => _.points.filter((_, index) => index % 3 !== 0),
    $get_anchorPoints: () => _.points.filter((_, index) => index % 3 === 0),

    PointAlong: (t) => {
      let points = [..._.points];
      while (points.length > 1) {
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
          const x = (1 - t) * points[i].x + t * points[i + 1].x;
          const y = (1 - t) * points[i].y + t * points[i + 1].y;
          newPoints.push(Point({ x, y }));
        }
        points = newPoints;
      }
      return points[0];
    },
    $test_PointAlong: [
      "returns correct start point",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 1 }),
          Point({ x: 3, y: 0 }),
        ];
        const start = _.PointAlong(0);
        assert(start.matches({ x: 0, y: 0 }), "Start point should match");
      },
      "returns correct end point",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 1 }),
          Point({ x: 3, y: 0 }),
        ];
        const end = _.PointAlong(1);
        assert(end.matches({ x: 3, y: 0 }), "End point should match");
      },
      "returns midpoint for t = 0.5",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 1 }),
          Point({ x: 3, y: 0 }),
        ];
        const mid = _.PointAlong(0.5);
        assert(
          mid.x > 1 && mid.x < 2 && mid.y > 0,
          "Midpoint should be between control points"
        );
      },
      "handles multiple segments",
      (_) => {
        _.points = [
          Point({ x: 0, y: 0 }),
          Point({ x: 1, y: 1 }),
          Point({ x: 2, y: 1 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 3, y: 0 }),
          Point({ x: 4, y: -1 }),
          Point({ x: 5, y: -1 }),
          Point({ x: 6, y: 0 }),
        ];
        const point = _.PointAlong(0.75);
        assert(
          point.x > 3 && point.x < 6,
          "Point should be in the second half of the curve"
        );
      },
    ],

    ToShape: (numPoints = 100) => {
      const points = [_.PointAlong(0)];
      for (let i = 1; i < numPoints - 1; i++)
        points.push(_.PointAlong(i / numPoints));

      points.push(_.PointAlong(1));
      return Shape({ points });
    },
    $test_ToShape: [
      "works",
      (_) => {
        _.points = [
          Point({ x: 1, y: 0 }),
          Point({ x: 0, y: 1 }),
          Point({ x: 2, y: 2 }),
          Point({ x: 1, y: 2 }),
        ];

        assert(_.ToShape().points.length === 100);
      },
    ],
  }),
  Points
);
