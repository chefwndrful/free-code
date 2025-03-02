useTests("Parser", () => {
  {
    window.T_COLORS = {
      BOOLEAN: `#FF9D65`,
      FUN_FIELD: `#7AA2F7`,
      FIELD: `#7DCFFF`,
      ELEMENT: "#F7768E",
      TEXT: `#FFF`,
      KEYWORD: `#7AA2F7`,
      STRING_DOUBLE: `#9ECE6A`,
      STRING_TEMPLATE: `#9ECE6A`,
      STRING_TEXT: `#9ECE6A`,
      ESCAPED_CHAR: `#88DDFF`,
      IDENTIFIER: `#BB9AF7`,
      NUMBER: `#FF9D65`,
      COMMENT: `#444B6A`,
      LINE_COMMENT: `#444B6A`,
      KEY: `#73DACA`,
      OP: `#88DDFF`,
      PARAMETER: `#E0AF67`,
      ERROR: `#F7768E`,
      RETURN: `#BB9AF7`,
    };
    window.T_COLORS = T_COLORS;

    window.T = {
      ANYTHING: /^[\s\S]/,
      NOTHING: /^\b\B/,
      END: /^$/,
      LINE: /^[^\n]*/,

      UNKNOWN: /^[\s\S]/,
      MISSING: /(?!.|^)/,

      NEW_LINE: /^(\r\n|\r|\n)/,
      WHITE_SPACE: /^[ \u00A0]+/,
      EMPTY_LINES: /^(?:\r?\n\s*)+/,
      TAB: /^\t/,

      COMMA: /^,/,
      PERIOD: /^\./,
      SEMICOLON: /^;/,
      COLON: /^:/,
      EXCLAMATION: /^!/,
      QUESTION: /^\?/,

      SLASH: /^\//,
      BACKSLASH: /^\\/,

      PIPE: /^\|/,
      TILDE: /^~/,
      BACK_TICK: /^`/,
      AT: /^@/,
      HASH: /^#/,
      DOLLAR: /^\$/,
      PERCENT: /^%/,
      CARET: /^\^/,
      AMPERSAND: /^&/,
      ASTERISK: /^\*/,
      UNDERSCORE: /^_/,

      LEFT_PAREN: /^\(/,
      RIGHT_PAREN: /^\)/,

      LEFT_CURLY: /^\{/,
      RIGHT_CURLY: /^\}/,

      LEFT_BRACKET: /^\[/,
      RIGHT_BRACKET: /^\]/,

      MINUS: /^-/,
      PLUS: /^\+/,
      EQUAL: /^=/,
      LESS_THAN: /^</,
      GREATER_THAN: /^>/,
      INCREMENT: /^\+\+/,
      DECREMENT: /^--/,

      QUOTE: /^"/,
      SINGLE_QUOTE: /^'/,

      NUMBER: /^\d*\.?\d+(?:[Ee][-+]?\d+)?/,
      INTEGER: /^\d+/,
      FLOAT: /^\d*\.\d+/,
      HEX: /^0x[a-fA-F0-9]+/,
      OCTAL: /^0o[0-7]+/,
      BINARY: /^0b[01]+/,

      IDENTIFIER: /^[a-zA-Z_$][a-zA-Z0-9_$]*/,
      TYPE: /^:[a-zA-Z_][a-zA-Z0-9_]*/,

      STRING_DOUBLE: /^"([^"\\]*(\\.[^"\\]*)*)"/,
      STRING_SINGLE: /^'([^'\\]*(\\.[^'\\]*)*)'/,

      LINE_COMMENT: /^\/\/.*/,
      BLOCK_COMMENT_START: /^\/\*/,
      BLOCK_COMMENT_END: /^\*\//,

      ASSIGN: /^=(?!=)/,
      ADD_ASSIGN: /^\+=/,
      SUBTRACT_ASSIGN: /^\-=/,
      MULTIPLY_ASSIGN: /^\*=/,
      DIVIDE_ASSIGN: /^\/=/,
      MODULO_ASSIGN: /^%=/,
      EXPONENT_ASSIGN: /^\^=/,

      ADD: /^\+(?!=|\+)/,
      SUBTRACT: /^\-(?!=|-)/,
      MULTIPLY: /^\*(?!=)/,
      DIVIDE: /^\/(?!=|\/)/,
      MODULO: /^%(?!=)/,
      EXPONENT: /^\^(?!=)/,

      COMPARE: /^(<=|>=|!=|==|<|>|in\b)/,

      URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

      ARROW: /^=>/,
      AND: /^and\b/,
      OR: /^or\b/,
      NOT: /^not\b/,
      FUN: /^fun\b/,
      RETURN: /^return\b/,
      FOR: /^for\b/,
      IN: /^in\b/,
      OF: /^of\b/,
      WHILE: /^while\b/,
      DO: /^do\b/,
      BREAK: /^break\b/,
      CONTINUE: /^continue\b/,
      IF: /^if\b/,
      ELIF: /^elif\b/,
      ELSE: /^else\b/,

      EQUALITY: /^==/,
      INEQUALITY: /^\!=/,
      LESS_THAN_EQUAL: /^<=/,
      GREATER_THAN_EQUAL: /^>=/,

      RANGE: /^\.\./,
      RANGE_EQUAL: /^\.=/,

      MARKDOWN_TEXT: /^.*?(?=[*_`{](?=\S)|\n|$)/,
      MARKDOWN_TEXT_FORMATTER: /^[*_`{]/,
      MARKDOWN_WORD: /^[*_`{]/,
      WORD: /^\S+\s*/,
      SPACER: /^\s*(\n|$)/,
      LIST_ITEM: /^ *(-|\d*\.) /,
      CHECKBOX: /^\[.{0,1}\]/,
      HEADING: /^#+ /,
      BLOCKQUOTE: /^> /,
      HORIZONTAL_RULE: /^---/,
      DISPLAY_CODE_BLOCK: /^```\w*/,

      PARAGRAPH_END: /^(\n\n)|$/,
      PARAGRAPH_TEXT: /^[^\\{*`_~\n]+/,
      PARAGRAPH_TEXT_UNDERLINE: /^__/,
      STRING_TEXT: /^[^"\\{]+/,
      ESCAPED_CHAR: /^\\[^\s\n]/,

      CSS_VAR: /^--[\w-]+/,
      CSS_PSEUDO: /^(:[a-z-]+(\([^\)]+\))?|::[a-z-]+)/,
      CSS_DURATION_DELAY: /^\d+(?:\.\d+)?(s|ms)/,
      CSS_TIMING_FUNCTION:
        /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)/,
      CSS_ITERATION_COUNT: /^(\d+(?:\.\d+)?|infinite)/,
      CSS_DIRECTION: /^(normal|reverse|alternate|alternate-reverse)/,
      CSS_PLAY_STATE: /^(running|paused)/,
      CSS_FILL_MODE: /^(none|forwards|backwards|both)/,
      CSS_ID: /^#([a-zA-Z_][a-zA-Z0-9_-]*)/,
      CSS_CLASS: /^\.([a-zA-Z_][a-zA-Z0-9_-]*)/,

      HTML_BOOLEAN_ATTR: /^:([a-zA-Z_][a-zA-Z0-9_]*)/,
      HTML_ATTR_PREFIX: /^([a-zA-Z_][a-zA-Z0-9_]*:)/,
      HTML_TAG_NAME: /^\|\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\|/,
      HTML_EVENT_PROP: /^on[a-z_]+$/,
      COLORS: {},
    };
    Object.entries(T).forEach(([key, value]) => {
      value.type = key;
      value.REGEX = true;
    });
    window.T = T;
  }

  const WHITESPACE_REGEX = /(?:[ ]+\n?|\n)/y;

  class $AST {
    static AST = true;
    static fallbackToFirstExp = true;
    static allowIncompleteParse = false;
    static incompleteParseThreshold = 1;
    static s = ``;

    constructor({ exps = [], ...rest } = {}) {
      Object.assign(this, rest);

      this.id = useId();
      this._exps = exps;
      this._tokens = [];
      this.exps.forEach((exp, i) => {
        if (exp.TOKEN) this._tokens.push(exp);
        else if (exp.AST) this._tokens.push(...exp.tokens);
      });

      this._text = this.tokens.map((t) => t.value).join("");

      this.s = this.constructor.s;
      this.name = this.constructor.name;
      this.AST = true;
    }
    get exps() {
      return this._exps;
    }
    get tokens() {
      return this._tokens;
    }
    get text() {
      return this._text;
    }
    get lineStart() {
      return this.exps[0] ? this.exps[0].lineStart : 0;
    }
    get lineEnd() {
      return this.exps.at(-1) ? this.exps.at(-1).lineEnd : 0;
    }
    toSimpleObj(lineStart = 0, lineEnd = Infinity, offset = 0) {
      return {
        exps: this.exps
          .filter((e) => {
            // console.log(e, e.lineStart, e.lineEnd, lineStart, lineEnd);
            return (
              e.lineStart <= lineEnd + offset && e.lineEnd >= lineStart - offset
            );
          })
          .map((e) => e.toSimpleObj(lineStart, lineEnd, offset)),
        name: this.name,
        lineStart: this.lineStart,
        lineEnd: this.lineEnd,
        s: this.s,
      };
    }

    getVisibleTokens(lineStart = 0, lineEnd = Infinity) {
      const tokens = [];

      this.exps.forEach((exp) => {
        if (exp.AST) tokens.push(...exp.getVisibleTokens(lineStart, lineEnd));
        else if (
          exp.TOKEN &&
          exp.lineStart <= lineEnd &&
          exp.lineEnd >= lineStart
        )
          tokens.push({
            value: exp.value,
            s: exp.s,
            line: exp.line,
            col: exp.col,
            indent: exp.indent,
            astName: this.name.slice(1),
            astId: this.id,
          });
      });
      return tokens;
    }

    static parse(_ = new Lexer()) {
      const startCursor = _.cursor;
      let firstExpCursor = _.cursor;
      let firstExp = null;
      const exps = [];

      for (let shapeIndex = 0; shapeIndex < this.SHAPE.length; shapeIndex++) {
        let shapeExp = this.SHAPE[shapeIndex];

        let results = shapeExp.parse(_);

        const isFirstAST = results && !shapeExp.TEXT_EXP && shapeIndex === 0;
        if (isFirstAST) {
          firstExp = results[0];
          firstExpCursor = _.cursor;
        }

        if (results) {
          exps.push(...results);
        } else if (
          this.allowIncompleteParse &&
          exps.filter((e) => e.AST || e.value.trim().length).length >=
            this.incompleteParseThreshold
        ) {
          const token = new Token(_.eat(new RegExp()));
          token.isMissing = true;
          token.shapeExp = shapeExp;
          exps.push(token);
        } else if (this.fallbackToFirstExp) {
          _.cursor = firstExpCursor;
          return firstExp;
        } else {
          _.cursor = startCursor;
          return null;
        }
      }

      return new this({ exps });
    }
  }

  class Token {
    constructor({
      type = T.UNKNOWN,
      value = "",
      start = 0,
      end = 0,
      line = 0,
      col = undefined,
      indent = 0,
      ...rest
    } = {}) {
      this.type = type;
      this.value = value;
      this.start = start;
      this.indent = indent;
      this._line = line;
      this.col = col || start;
      this.end = end;

      Object.assign(this, rest);
      this.TOKEN = true;
    }

    get text() {
      return this.value;
    }
    get line() {
      return this._line; //+ this.value.count("\n");
    }
    get lineStart() {
      return this.line;
    }
    get lineEnd() {
      return this.line;
    }
    toSimpleObj() {
      return {
        value: this.value,
        line: this.line,
        col: this.col,
        s: this.s,
      };
    }

    get s() {
      return this.shapeExp ? this.shapeExp.s || "" : "";
    }
  }

  class Lexer {
    constructor(str = "") {
      this.str = str;
      this.cursor = 0;
      this.tasteCursor = 0;
      this.tokenCache = {};
      this.cache = {};
      this.cursorStack = [];
      this.useCache = false;

      this.lines = this.str.split("\n");

      this.lineOffsets = (() => {
        let offsets = []; // The first line starts at index 0

        let cursor = 0;
        for (const line of this.lines) {
          offsets.push([cursor, cursor + line.length]);
          cursor += line.length + 1;
        }
        return offsets;
      })();
      this.lineIndents = this.lines.map((l) => l.length - l.trimStart().length);
    }

    get hasMoreToLex() {
      return this.cursor < this.str.length;
    }
    get currentLine() {
      // let _cursor = 0;
      // for (let line = 0; line < this.lines.length; line++)
      //   if ((_cursor += this.lines[line].length + 1) > this.cursor) return line;
      // return -1;
      return this.lineOffsets.binarySearch(([start, end]) => {
        if (this.cursor < start) return -1;
        else if (this.cursor > end) return 1;
        else return 0;
      });
    }
    get currentLineStart() {
      return this.lineStart(this.currentLine);
    }
    get currentLineEnd() {
      return this.lineEnd(this.currentLine);
    }
    get currentLineContentStart() {
      return this.lineContentStart(this.currentLine);
    }
    get currentLineContentEnd() {
      return this.lineContentEnd(this.currentLine);
    }
    get currentCol() {
      let _cursor = 0;
      for (let line = 0; line < this.lines.length; line++)
        if (_cursor + this.lines[line].length + 1 > this.cursor)
          return this.cursor - _cursor;
        else _cursor += this.lines[line].length + 1;

      return -1;
    }
    get currentIndent() {
      return this.lineIndent(this.currentLine);
    }
    get parsedStr() {
      return this.str.slice(0, this.cursor);
    }
    get unparsedStr() {
      return this.str.slice(this.cursor);
    }

    pushCursor() {
      this.cursorStack.push(this.cursor);
    }
    popCursor() {
      if (this.cursorStack.length) this.cursor = this.cursorStack.pop();
    }

    lineIndent(line) {
      return this.lineIndents[line];
    }
    lineStart(line) {
      if (line >= this.lines.length) line = this.lines.length - 1;
      return this.lineOffsets[line][0];
    }
    lineEnd(line) {
      if (line >= this.lines.length) line = this.lines.length - 1;
      return this.lineOffsets[line][1];
    }
    lineContentStart(line) {
      return this.lineStart(line) + this.lineIndent(line);
    }
    lineContentEnd(line) {
      return this.lineStart(line) + this.lines[line].trimEnd().length;
    }
    linesInRange(start, end) {
      const result = [];

      for (let i = 0; i < this.lineOffsets.length; i++) {
        const [lineStart, lineEnd] = this.lineOffsets[i];
        if (lineStart <= end && lineEnd >= start) result.push(i);
      }
      return result;
    }

    isLexable(x) {
      return typeof x === "string" || x instanceof RegExp;
    }

    cacheGet(cursor = 0, name = "") {
      return this.cache[`${cursor}-${name}`];
    }
    cacheSet(item, cursor = 0, name = "") {
      return (this.cache[`${cursor}-${name}`] = {
        ast: item,
        cursorOnSave: this.cursor,
      });
    }

    taste(regex) {
      // const start = performance.now();
      if (!regex) return null;
      this.tasteCursor = this.cursor;

      const eatLeadingWhitespace = () => {
        while (
          this.str[this.tasteCursor] === " " ||
          this.str[this.tasteCursor] === "\n"
        ) {
          this.tasteCursor++;
        }
      };

      let match;
      if (typeof regex === "string") {
        let failedMatch = false;
        for (let i = 0; i < regex.length && !failedMatch; i++)
          failedMatch = regex[i] !== this.str[this.tasteCursor + i];
        // tasteTime += performance.now() - start;
        if (!failedMatch) {
          this.tasteCursor += regex.length;
          return { value: regex };
        }
      } else if (regex instanceof RegExp) {
        regex.lastIndex = this.tasteCursor;

        // Regexes must have 'y' or 'g' flag and not start with '^' for this to work
        match = regex.exec(this.str);

        if (match) this.tasteCursor += match[0].length;
        // tasteTime += performance.now() - start;
        return match && { value: match[0] };
      }
      return null;
    }
    eat(regex) {
      if (!regex) return null;

      const result = this.taste(regex);

      if (result) {
        const { value } = result;

        this.cursor = this.tasteCursor - value.length;

        let col = this.cursor - this.str.lastIndexOf("\n", this.cursor - 1) - 1;
        if (col < 0) col = 0;

        const line = this.currentLine;
        const token = new Token({
          type: regex,
          value,
          start: this.cursor,
          indent: this.lineIndents[line],
          line,
          end: this.cursor + value.length,
          col, //: this.currentCol,
          paddingRight: "",
          paddingLeft: "",
        });

        this.cursor += value.length;

        return token;
      } else return null;
    }
  }
  window.Lexer = Lexer;

  class ShapeExp {
    constructor({
      value,
      rightDelimeter,
      min = 1,
      max = 1,
      domProps = {},
    } = {}) {
      this.value = value;
      this.rightDelimeter = rightDelimeter;
      this.min = min;
      this.max = max;
      this.domProps = domProps;

      this.TEXT_EXP =
        typeof this.value === "string" || this.value instanceof RegExp;
      this.AST_EXP =
        typeof this.value === "function" &&
        !!this.value.name &&
        this.value.name[0] === "$";
      this.SUB_SHAPE_EXP = this.value instanceof Shape;
      this.OPTION_EXP = Array.isArray(this.value) && !this.SUB_SHAPE_EXP;
      this.LAZY_EXP = typeof this.value === "function" && !this.AST_EXP;

      if (this.value instanceof RegExp)
        this.value = ShapeExp.formatRegex(this.value);
      if (this.rightDelimeter instanceof RegExp)
        this.rightDelimeter = ShapeExp.formatRegex(this.rightDelimeter);

      this.name = `${this.value}`;
      if (this.AST_EXP) this.name = this.value.name;
      else if (this.OPTION_EXP) {
        this.value = new Shape(...this.value);
        this.name = this.value.map((o) => o.name || `${o}`).join("-");
      } else if (this.SUB_SHAPE_EXP) this.name = this.value.id.toString();
    }

    static formatRegex(regex) {
      let source = regex.source;
      if (source[0] === "^") source = source.slice(1);
      let flags = regex.flags;
      if (!flags.includes("y")) flags += "y";
      return new RegExp(source, flags);
    }

    parse(_ = new Lexer()) {
      const results = [];
      const startCursor = _.cursor;
      for (
        let expIndex = 0;
        expIndex < this.max &&
        (!_.taste(this.rightDelimeter) || expIndex === 0);
        expIndex++
      ) {
        while (_.taste(WHITESPACE_REGEX)) results.push(_.eat(WHITESPACE_REGEX));
        let result = null;
        if (this.LAZY_EXP) {
          Object.assign(
            this,
            new ShapeExp({
              ...this,
              value: this.value(),
            })
          );
        }
        if (this.TEXT_EXP) result = _.eat(this.value);
        else if (this.AST_EXP) {
          const firstShapeExp = this.value.SHAPE[0];
          if (
            firstShapeExp &&
            typeof firstShapeExp === "object" &&
            firstShapeExp.TEXT_EXP &&
            !_.taste(firstShapeExp.value)
          )
            result = null;
          else result = this.value.parse(_);
        } else if (this.OPTION_EXP)
          for (let i = 0; i < this.value.length && !result; i++)
            if (_.isLexable(this.value[i])) result = _.eat(this.value);
            else result = this.value[i].parse(_);
        else if (this.SUB_SHAPE_EXP) {
          const firstShapeExp = this[0];
          if (
            firstShapeExp &&
            typeof firstShapeExp === "object" &&
            firstShapeExp.TEXT_EXP &&
            !_.taste(firstShapeExp.value)
          )
            result = null;
          else {
            const $SUB_SHAPE_AST = class extends $AST {};
            $SUB_SHAPE_AST.SHAPE = this.value;
            const ast = $SUB_SHAPE_AST.parse(_);
            if (ast) result = ast.exps;
          }
        }

        if (result) {
          result.shapeExp = {};
          Object.assign(result.shapeExp, this);
          Object.setPrototypeOf(result.shapeExp, Object.getPrototypeOf(this));
          results.push(...useArray(result));
        } else if (expIndex >= this.min) break;
        else {
          _.cursor = startCursor;
          return null;
        }
      }
      while (_.taste(WHITESPACE_REGEX)) results.push(_.eat(WHITESPACE_REGEX));

      return results;
    }
  }
  class Shape extends Array {
    constructor(...exps) {
      super();

      this.id = useId();
      const isLimitExp = (expIndex) => {
        const exp = exps[expIndex];
        return (
          exp &&
          typeof exp === "object" &&
          exp.hasAnyOwnProperty("min", "max", "s", "Element")
        );
      };
      const parseLimitExp = (expIndex) => {
        const nextExp = exps[expIndex + 1];
        return isLimitExp(expIndex + 1) ? nextExp : {};
      };
      const parseRightDelimeter = (expIndex) => {
        let nextExp = exps[expIndex + (isLimitExp(expIndex + 1) ? 2 : 1)];
        if (
          nextExp &&
          (typeof nextExp === "string" || nextExp instanceof RegExp)
        )
          return nextExp;

        return null;
      };

      for (let i = 0; i < exps.length; i++) {
        const value = exps[i];
        if (value === null || isLimitExp(i)) continue;

        let shapeExp = new ShapeExp({
          value,
          rightDelimeter: parseRightDelimeter(i),
        });

        Object.assign(shapeExp, parseLimitExp(i));
        this.push(shapeExp);
      }

      // console.log();
      // this.push(new ShapeExp({ value: /\s+/y, min: 0 }));
    }
  }

  const $s = {
    OP: `fc:${T_COLORS.OP}`,
    KEYWORD: `fc:${T_COLORS.KEYWORD}`,
    IDENTIFIER: `fc:white`,
    NUMBER: `fc:${T_COLORS.NUMBER}`,
    BOOLEAN: `fc:${T_COLORS.BOOLEAN}`,
    COMMENT: `fc:#51597d`,
    STRING: `fc:#9ece6a`,
    TEXT: `fc:${T_COLORS.TEXT}`,
    ELEMENT: `fc:${T_COLORS.ELEMENT}`,
    ERROR: `td:(underline wavy ${T_COLORS.ERROR})`,
  };

  class $ROOT extends $AST {}

  class $AST_LEFT_RECURSIVE extends $AST {
    static parse(_ = new Lexer()) {
      const SHAPE = this.SHAPE;
      let leftCursor = _.cursor;
      let $left = this.SHAPE[0].parse(_);
      if (!$left) return null;
      else $left = $left[0];

      leftCursor = _.cursor;

      while (_.taste(this.SHAPE[0].rightDelimeter)) {
        const allowIncompleteParse = this.allowIncompleteParse;
        const $RIGHT = class extends $AST {
          static allowIncompleteParse = allowIncompleteParse;
          static SHAPE = (() => {
            const shape = new Shape();
            shape.push(...SHAPE.slice(1));
            return shape;
          })();
        };
        const $right = $RIGHT.parse(_);

        if (!$right) {
          _.cursor = leftCursor;
          return $left;
        }
        $left = new this({ exps: [$left, ...$right.exps] });
      }
      return $left;
    }
  }
  class $INDENT_BLOCK extends $AST {
    static parse(_ = new Lexer()) {
      _.pushCursor();
      do _.cursor--;
      while (_.str[_.cursor] && !_.str[_.cursor].trim());
      const prevToken = _.eat(/\S/y);
      _.popCursor();
      const baseIndent = prevToken ? prevToken.indent : _.currentIndent;

      if (prevToken)
        if (prevToken.line === _.currentLine) {
          const $exp = $AST.parse.apply(this, [_]);
          if ($exp) return new this({ exps: [$exp] });
          return null;
        } else if (_.currentIndent <= prevToken.indent) return null;

      const isIndented = () => {
        _.pushCursor();
        while (_.taste(WHITESPACE_REGEX)) _.eat(WHITESPACE_REGEX);
        const nextToken = _.eat(/\S/y);
        _.popCursor();
        return nextToken && nextToken.indent > baseIndent;
      };

      const exps = [];
      while (_.hasMoreToLex && isIndented()) {
        const $exp = $AST.parse.apply(this, [_]);
        if ($exp) exps.push(...$exp.exps);
        else {
          break;
        }
      }
      if (!exps.length) return null;
      return new this({ exps });
    }
  }
  class $EXP extends $AST {
    static parse(_ = new Lexer()) {
      let $exp = $AST.parse.apply(this, [_]);

      if ($exp) {
        const exps = $exp.exps;
        const indexOfAST = exps.findIndex((e) => e.AST);
        const ast = exps[indexOfAST];
        let leadingWhitespaceTokens = exps.slice(0, indexOfAST);
        let trailingWhitespaceTokens = exps.slice(indexOfAST + 1);
        $exp = new ast.constructor({
          exps: [
            ...leadingWhitespaceTokens,
            ...ast.exps,
            ...trailingWhitespaceTokens,
          ],
        });
      }

      return $exp;
    }
  }
  class $UNKNOWN extends $AST {
    static SHAPE = new Shape(/^\S+/, {
      s: `td:(underline wavy salmon) fc:white`,
    });
  }
  class $UNKNOWN_BLOCK extends $AST {
    static SHAPE = new Shape(/^.*/, { s: $s.ERROR });
  }

  class $CODE_EXP extends $EXP {}
  class $CODE extends $AST {
    static SHAPE = new Shape([$CODE_EXP, $UNKNOWN], { min: 0, max: Infinity });
    static SAMPLES = [
      `
    deepClone = fun:
      if obj == dog or obj != \`object\`:
        return obj

      temp = obj.constructor()
      for key in obj:
        temp[key] = deelClone(obj[key])
        `,
      `
      mergeSort = fun arr:
        if arr.length < 2: return arr

        middle = Math.floor(arr.length / 2)
        left = arr[..middle]
        right arr[middle.=end]

        return merge(mergeSort(left), mergeSort(right))
      `,
      `
    merge = fun left, right:
      result = []
      leftIndex = 0
      rightIndex = 0

      while leftIndex < left.length and rightIndex < right.length:
        if left[leftIndex] < right[rightIndex]:
          result.push(left[leftIndex])
          leftIndex += 1
        else
          result.push(right[rightIndex])
          rightIndex += 1

      return result.concat(left[leftIndex.=end]).concat(right[rightIndex.=end])
          `,
      `
    throttle = fun limit:
      return fun:
        context = this
        args = arguments
        if !lastRan:
          func.apply(context, args)
          lastRan = Date.now()
        else
          clearTimeout(lastFunc)
          lastFunc = setTimeout(
            fun:
              if Date.now() - lastRan >= limit:
                func.apply(context, args)
                lastRan = Date.now()
              limit = Date.now() = lastRan
          )
          `,
      `
    debounce = fun func, delay:
      return fun:
        context = this
        args = arguments
        clearTimeout(inDebounce)
        inDebounce = setTimeout(fun: func.apple(context, args), delay)
          `,
      `
    binarySearch = fun arr, target:
      left = 0
      right = arr.length - 1

      while left <= right:
        mid = Math.floor((left + right) / 2)
        foundVal = arr[mid]

        if foundVal == target: return mid
        elif foundVal < target: left = mid + 1
        else right = mid - 1

      return -1
          `,
      `
    quickSort = fun arr:
      if arr.length <= 1: return arr

      pivot = arr[-1]
      left = []
      right = []

      for i in ..arr.length:
        if arr[i] < pivot: left.push(arr[i])
        else right.push(arr[i])
          `,
      `
    todos = []
    todoOptions = [
      max: 50,
      subOptions: [
        min: 20
      ]
    ]

    Home = fun:
      return
        $div 'flex row' name:{getName()}
          $h1 \`Welcome to the Todo App\`
          $\{Link} to:\`/todos\` \`Go to Todos\`

    TodoPage = fun:
      return
        $div
          $h1 \`Todo List\` 'w:100px h:50%'
          {/* Todo components will go here */}

    App = fun:
      return
        $\{Router}
          $\{Routes}
            $\{Route} path:\`/\` element:{$\{Home}}
            $\{Route} path:\`/todos\` element:{$\{TodoPage}}

    render($App, dog)
          `,

      // INVALID
      `
for i :
    a
    b
    `,
    ];
  }
  window.$CODE = $CODE;
  class $CODE_LINE_TOKENS extends $AST {}
  class $CODE_PORTAL extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      "{",
      { s: $s.OP },

      [$CODE_EXP, $UNKNOWN],
      { min: 0, max: Infinity },

      "}",
      { s: $s.OP }
    );
    static SAMPLES = [
      `{}`,
      `{a}`,
      `{
      a
    b
    }`,

      // INCOMPLETE
      `{`,

      // $UNKNOWN
      `{:}`,
    ];
  }

  class $PARENTHESIZED_CODE_EXP extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      "(",
      { s: $s.OP },

      $CODE_EXP,

      ")",
      { s: $s.OP }
    );
    static SAMPLES = [
      `(a)`,
      `(\na\n)`,
      `($a
  $b
  $c)`,

      // ORDER OF OPERATIONS
      `(a + b)`,

      // INCOMPLETE
      `(`,
    ];
  }

  class $NUMBER extends $AST {
    static SHAPE = new Shape(
      /(0x[\da-fA-F]+|-?\d+(\.\d+)?[a-zA-Z][-+]?\d*|-?\d*\.\d+|-?\d+)/,
      { s: $s.NUMBER }
    );
    static SAMPLES = [
      // Integers
      // "1",
      "-123",
      "456",
      "-456",
      "7890",
      "-7890",
      "10",
      "-10",
      "002",
      "-002",

      // Floats
      "123.456",
      "-123.456",
      "0.001",
      "-0.001",
      "3.14159",
      "-3.14159",
      ".5",
      "-.5",
      "0.99",
      "-0.99",
      "0.0001",
      "-0.0001",

      // Hexadecimal
      "0x1A",
      "0xFF",
      "0x00ff",
      "0xdeadBEEF",
      "0xABCDEF",

      // Scientific Notation
      "1e10",
      "-1e10",
      "2.5e-3",
      "-2.5e-3",
      "3.14E+2",
      "-3.14E+2",
      "6.02e23",
      "-6.02e23",
      "1.6E-19",
      "-1.6E-19",
      "4e2",
      "-4e2",
      "5.5e-2",
      "-5.5e-2",

      // Algebra Term
      "2x",
      "-2x-4",
    ];
  }

  class $COMMENT extends $AST {
    static SHAPE = new Shape(/^(\/\/.*|\/\*[\s\S]*?\*\/)/, {
      s: $s.COMMENT,
    });
    static SAMPLES = [
      // Line comments
      "// This is a line comment",
      "//Another line comment",
      "//123456789",
      "// Special characters !@#$%^&*()",

      // Block comments
      "/* This is a block comment */",
      "/* Block\ncomment\nacross\nmultiple lines */",
      "/*123456789*/",
      "/* Special characters !@#$%^&*()*/",
    ];
  }
  class $BOOLEAN extends $AST {
    static SHAPE = new Shape(/^(true|false)\b/, { s: $s.BOOLEAN });
    static SAMPLES = ["true", "false"];
  }
  class $KEYWORD extends $AST {
    static SHAPE = new Shape(/^(break|continue)\b/, {
      s: $s.KEYWORD,
    });
    static SAMPLES = [`break`, "continue"];
  }
  class $IDENTIFIER extends $AST {
    static SHAPE = new Shape(
      /^[a-zA-Z_#@][a-zA-Z0-9_#@]*/,
      {
        s: $s.IDENTIFIER,
      },
      { min: 0 }
    );
    static SAMPLES = [
      "a",
      "Z",
      "variable",
      "MyVariable",
      "anotherVar",
      "_underscore",
      "__doubleUnderScore",
      "_privateVar",
      "camelCaseVar",
      "snake_case_var",
      "var123",
      "name2var",
      "abc123XYZ",
      "__proto__",
      "_cache",
      "functionName",
      "_",
      "userName",
      "user1Name",
      "alphaBeta123",
      "_123abc",
      "_combo",
      "#blessed",
      "#great#awesome",
      "CAPITALCASE",
      "lowercase",
      "Mixed123Case_",
      "_underscore123",
      "a1_b2_c3",
      "valid_Name",
      "Valid123",
      "_validName",
      "user#name",
      "@atSymbol",
      "user@name",
      "@_withUnderscore",
      "@combo",
      "email@address",
      "@valid123",
      "var@name",
      "@myVar",
      "name@WithNumber123",
      "@_underscore",
      "ALL_UPPERCASE",
      " \n a \n ",
    ];
  }
  window.$IDENTIFIER = $IDENTIFIER;

  class $CODE_BLOCK extends $INDENT_BLOCK {
    static SHAPE = new Shape([$CODE_EXP, $UNKNOWN]);
  }

  class $FOR extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^for\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $IDENTIFIER,

      new Shape(",", { s: `fc:${T_COLORS.OP}` }, $IDENTIFIER),
      { min: 0 },

      /^in\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $CODE_EXP,

      new Shape(/^and\b/, $CODE_EXP),
      { min: 0, max: Infinity },

      ":",
      {
        s:
          $s.OP +
          `inlineb  fs:0.9em  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $CODE_BLOCK
    );

    static SAMPLES = [
      `for a in b: c`,
      `for a, b in c: d`,
      `for a in b and c: d`,
      `for a, b in c and d and e and f: g`,
      `
    for a in b:
      c
      for d in e and f or g:
      g
    `,

      // INCOMPLETE
      `for dog cat`,
    ];
  }

  class $DO_WHILE extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^do\b/,
      { s: $s.KEYWORD },

      $CODE_BLOCK,

      /^while\b/,
      { s: $s.KEYWORD },

      $CODE_EXP
    );
    static SAMPLES = [
      `do b while c`,
      `
do
  b
  do c while d
while e
`,

      // INCOMPLETE
      `do b c`,
    ];
  }
  class $WHILE extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^while\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $CODE_EXP,

      ":",
      { s: $s.OP },

      $CODE_BLOCK
    );
    static SAMPLES = [
      `while a: b`,
      `
while a:
  b
  while c: d
  e
`,

      // INCOMPLETE
      `while b c`,
    ];
  }

  class $ELSE extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^else\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb p:(0em .2em) fs:0.9em fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $CODE_BLOCK
    );
    static SAMPLES = [
      `else b`,
      `
else
  b
  else c
  d
`,

      // INCOMPLETE
      `else`,
    ];
  }

  class $ELIF extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      [/^elif\b/, /^fi\b/],
      {
        s:
          $s.KEYWORD +
          `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $CODE_EXP,

      ":",
      {
        s:
          $s.OP +
          `inlineb  fs:0.9em  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      $CODE_BLOCK
    );
    static SAMPLES = [
      // ELIF
      `elif a: b`,
      `
elif a:
  b
  elif c: d
  e
`,

      // INCOMPLETE
      `elif : b`,

      // FI
      `fi a: b`,
      `
fi a:
  b
  fi c: d
  e
`,

      // INCOMPLETE
      `fi : b`,
    ];
  }
  class $IF extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    // static s = `p:10px r:.25em b:(2px solid salmon)`;
    static SHAPE = new Shape(
      /^if\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) fs:0.9em r:0.33em`,
      },

      $CODE_EXP,

      ":",
      {
        s:
          $s.OP +
          `inlineb bg:linear-gradient(45deg,#ff6ec4,#7873f5) ml:.25em r:0.33em`,
      },

      $CODE_BLOCK
    );
    static SAMPLES = [
      ` \n  if a: b \n \n`,
      `
    if a:
      b
      if c: d
      e
    `,

      // INCOMPLETE
      `if : b`,
    ];
  }

  class $CASE extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^case\b/,
      { s: $s.KEYWORD },

      $CODE_EXP,

      ":",
      { s: $s.OP },

      $CODE_BLOCK
    );
    static SAMPLES = [
      `case a: b`,
      `
case a:
  b
  case c: d
  e
`,

      // INCOMPLETE
      `case : b`,
    ];
  }
  class $SWITCH_BODY extends $INDENT_BLOCK {
    static SHAPE = new Shape($CASE);
  }
  class $SWITCH extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^switch\b/,
      { s: $s.KEYWORD },

      $CODE_EXP,

      ":",
      { s: $s.OP },

      $SWITCH_BODY,

      $ELSE,
      { min: 0 }
    );
    static SAMPLES = [
      `switch a: case b: c`,
      `
switch a:
  case b: c
  case d: e
  else f
`,

      // INCOMPLETE
      `switch :`,
    ];
  }

  class $FUN extends $AST {
    static isBoundary = true;
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      /^fun\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) fs:0.9em bold r:0.33em |:hover| fc:blue`,
      },

      new Shape($CODE_EXP, ",", { min: 0, s: $s.OP }),
      { min: 0, max: Infinity },

      ":",
      { s: $s.OP },

      $CODE_BLOCK
    );
    static SAMPLES = [
      `fun: a`,
      `fun a, b: c`,
      `
fun a, b:
  fun a,b:
    c
  d
`,
      `fun a: return b()`,

      // INCOMPLETE
      `fun:`,
    ];
  }

  class $KEY_VALUE extends $AST {
    static SHAPE = new Shape(
      [$NUMBER, $IDENTIFIER, $CODE_PORTAL, () => $MARKUP_PORTAL],

      ":",
      { s: $s.OP },

      $CODE_EXP
    );
  }

  class $LIST_ITEM_CODE extends $AST {
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      [$KEY_VALUE, $CODE_EXP],

      ",",
      { s: $s.OP }
    );
  }
  class $LIST extends $AST {
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      "[",
      { s: $s.OP },

      $LIST_ITEM_CODE,
      { min: 0, max: Infinity },

      "]",
      { s: $s.OP }
    );
    static SAMPLES = [
      `[]`,
      `[a]`,
      `[ a ]`,
      `[\na\n]`,
      `[a,]`,
      `[a\n,\n]`,
      `[a,b]`,
      `[a, [b ,[c,]], d]`,
      `[a: b, c, d, e:f]`,
      `
    [
      a:b,
      a :b,
      a: b,
      a : b,
      a\n:\nb,
      a: !b,
      a: b = c,
      a: b - c,
      a: b * c,
      a: b ^ c,
      a: b.c,
      a: b..c,
    ]
    `,

      // INCOMPLETE
      `[2 3`,
    ];
  }
  const PRIMARY_CODE_EXP = [
    $PARENTHESIZED_CODE_EXP,
    $CODE_PORTAL,
    () => $MARKUP_PORTAL,
    () => $ELEMENT,
    $LIST,
    $FUN,
    $SWITCH,
    $IF,
    $ELIF,
    $ELSE,
    $FOR,
    $DO_WHILE,
    $WHILE,
    $NUMBER,
    $BOOLEAN,
    $KEYWORD,
    $IDENTIFIER,
  ];

  class $FIELD extends $AST {
    static SHAPE = new Shape(
      () => $FIELD_FUN_CALL,

      /^\.(?!\.|=)/,
      { s: $s.OP },

      () => $FIELD_RIGHT
    );
    static SAMPLES = [
      `a.b`,
      `a .b`,
      `a. b`,
      `a . b`,
      `a\n.\nb`,
      `a.b.c`,
      // ORDER OF OPERATIONS
      `a().b`,
      `a[b].c`,
      `[a:b, c:d].a`,
      `a.b().c`,
    ];
  }
  class $FIELD_RIGHT extends $FIELD {
    constructor(...args) {
      return new $FIELD(...args);
    }
    static SHAPE = new Shape(
      PRIMARY_CODE_EXP,

      /^\.(?!\.|=)/,
      { s: $s.OP },

      this
    );
  }

  class $INDEX extends $AST_LEFT_RECURSIVE {
    static SHAPE = new Shape(
      $FIELD,

      "[",
      { s: $s.OP },

      $CODE_EXP,

      "]",
      { s: $s.OP }
    );
    static SAMPLES = [
      `a[b]`,
      `a[b][c]`,
      `a[b][c][d]`,
      `a.b.c[d]`,
      `a[b].c[d]`,
      // `[a:b][a]`,
    ];
  }
  class $FIELD_INDEX extends $INDEX {
    constructor(...args) {
      return new $INDEX(...args);
    }
    static SHAPE = new Shape(
      $FIELD_RIGHT,

      "[",
      { s: $s.OP },

      $CODE_EXP,

      "]",
      { s: $s.OP }
    );
  }

  class $FUN_CALL extends $AST_LEFT_RECURSIVE {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $INDEX,

      "(",
      { s: $s.OP },

      $LIST_ITEM_CODE,
      { min: 0, max: Infinity },

      ")",
      { s: $s.OP }
    );
    static SAMPLES = [
      `a()`,
      `a(b)`,
      `a(b, c)`,
      `a(b, c)()(c)`,

      // ORDER OF OPERATIONS
      `a.b.c()`,
      `a().b()`,
      `a[b]()`,

      // INCOMPLETE
      `a(b`,
    ];
  }
  class $FIELD_FUN_CALL extends $FUN_CALL {
    constructor(...args) {
      return new $FUN_CALL(...args);
    }
    static SHAPE = new Shape(
      $FIELD_INDEX,

      "(",
      { s: $s.OP },

      new Shape($CODE_EXP, ",", { min: 0 }),
      { min: 0, max: Infinity, s: $s.OP },

      ")",
      { s: $s.OP }
    );
  }

  class $NEGATION extends $AST {
    static allowIncompleteParse = true;
    static SHAPE = new Shape(
      "!",
      { s: $s.OP },

      [this, $FUN_CALL]
    );
    static SAMPLES = [
      `!a`,
      `! a`,
      `!\na`,
      `!!a`,
      `!!!a`,
      // ORDER OF OPERATIONS
      `!a.b`,
      // INCOMPLETE
      `!`,
    ];
  }
  class $EXPONENT extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      [$NEGATION, $FUN_CALL],

      /^\^(?!=)/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // MODULO
      `a^b`,
      `a ^b`,
      `a^ b`,
      `a ^ b`,
      `a\n^\nb`,
      `a^b^c`,

      // ORDER OF OPERATIONS
      `!a ^ b`,
      `a ^ !b`,
      `a.b ^ c.d`,

      // INCOMPLETE
      `a^`,
    ];
  }
  class $MULTIPLICATIVE extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $EXPONENT,

      /^(%(?!=)|\/(?!=|\/)|\*(?!=))/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // MODULO
      `a%b`,
      `a %b`,
      `a% b`,
      `a % b`,
      `a\n%\nb`,
      `a%b%c`,

      // DIVIDE
      `a/b`,
      `a /b`,
      `a/ b`,
      `a / b`,
      `a\n/\nb`,
      `a/b/c`,

      // MULTIPLY
      `a*b`,
      `a *b`,
      `a* b`,
      `a * b`,
      `a\n*\nb`,
      `a*b*c`,

      // ORDER OF OPERATIONS
      `!a * b`,
      `a * !b`,
      `a * b ^ c`,
      `a.b * c.d`,

      // INCOMPLETE
      `a*`,
    ];
  }
  class $ADDITIVE extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $MULTIPLICATIVE,

      /^(-(?!=|-)|\+(?!=|\+))/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // SUBTRACT
      `a -b`,
      `a- b`,
      `a - b`,
      `a\n-\nb`,
      `a-b-c`,

      // ADD
      `a+b`,
      `a +b`,
      `a+ b`,
      `a + b`,
      `a\n+\nb`,
      `a+b+c`,

      // // ORDER OF OPERATIONS
      `!a + b`,
      `a - !b`,
      `a + b * c`,
      `a + b ^ c`,
      `a.b + c.d`,

      // INCOMPLETE
      `a+`,
    ];
  }

  class $COMPARISON extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $ADDITIVE,

      /^(>(?!=)|>=|<(?!=)|<=|==|!=)/,
      {
        s:
          $s.OP +
          `inlineb  fs:0.9em p:(0em .2em)  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
      },

      this
    );
    static SAMPLES = [
      // GREATER THAN
      `a>b`,
      `a >b`,
      `a> b`,
      `a > b`,
      `a\n>\nb`,
      `a>b>c`,

      // GREATER THAN EQUAL
      `a>=b`,
      `a >=b`,
      `a>= b`,
      `a >= b`,
      `a\n>=\nb`,
      `a>=b>=c`,

      // LESS THAN
      `a<b`,
      `a <b`,
      `a< b`,
      `a < b`,
      `a\n<\nb`,
      `a<b<c`,

      // LESS THAN EQUAL
      `a<=b`,
      `a <=b`,
      `a<= b`,
      `a <= b`,
      `a\n<=\nb`,
      `a<=b<=c`,

      // EQUAL
      `a==b`,
      `a ==b`,
      `a== b`,
      `a == b`,
      `a\n==\nb`,
      `a==b==c`,

      // NOT EQUAL
      `a!=b`,
      `a !=b`,
      `a!= b`,
      `a != b`,
      `a\n!=\nb`,
      `a!=b!=c`,

      // ORDER OF OPERATIONS
      `!a > b`,
      `a > !b`,
      `a + b > c`,
      `a * b > c`,
      `a ^ b > c`,
      `a.b > c.d`,

      // INCOMPLETE
      `a>`,
    ];
  }
  class $RANGE extends $AST {
    static SHAPE = new Shape(
      $COMPARISON,
      { min: 0 },

      /^(\.\.|\.=)/,
      { s: $s.OP },

      $COMPARISON,
      { min: 0 }
    );
    static SAMPLES = [
      //RANGE
      `a..b`,
      `a ..b`,
      `a.. b`,
      `a .. b`,
      `a\n..\nb`,

      // RANGE EQUALS
      `a.=b`,
      `a .=b`,
      `a.= b`,
      `a .= b`,
      `a\n.=\nb`,

      // POSTFIX RANGE
      `a..`,
      `a ..`,
      `a\n..`,

      // POSTFIX RANGE EQUALS
      `a.=`,
      `a .=`,
      `a\n.=`,

      // PREFIX RANGE
      `..a`,
      `.. a`,
      `..\na`,

      // PREFIX RANGE EQUALS
      `.=a`,
      `.= a`,
      `.=\na`,

      // EMPTY RANGE
      `..`,
      `..`,
      `..\n`,

      // EMPTY RANGE EQUALS
      `.=`,
      `.=`,
      `.=\n`,

      // ORDER OF OPERATIONS
      `!a .= b`,
      `a .= !b`,
      `a + b .= c`,
      `a * b .= c`,
      `a ^ b .= c`,
      `a > b .= c`,
      `a.b .= c.d`,
      `..a.b`,
    ];
  }

  class $LOGICAL_OR extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $RANGE,

      /^or\b/,
      {
        s:
          $s.OP +
          `inlineb  fs:0.9em p:(0em .2em)  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em `,
      },

      this
    );
    static SAMPLES = [
      `a or b`,

      `a\nor\nb`,
      `a or b or c`,

      // ORDER OF OPERATIONS
      `!a or b`,
      `a or b + c`,
      `a or b * c`,
      `a or b ^ c`,
      `a.b or c.d`,

      // INCOMPLETE
      `a or`,
    ];
  }
  class $LOGICAL_AND extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $LOGICAL_OR,

      /^and\b/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      `a and b`,

      `a\nand\nb`,
      `a and b and c`,

      // ORDER OF OPERATIONS
      `!a and b`,
      `a and b + c`,
      `a and b * c`,
      `a and b ^ c`,
      `a.b and c.d`,
      `a and b or c`,

      // INCOMPLETE
      `a and`,
    ];
  }

  class $TERINARY extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $LOGICAL_AND,

      "?",
      { s: $s.OP },

      $CODE_EXP,

      ":",
      { s: $s.OP },

      $CODE_EXP
    );
    static SAMPLES = [
      `a?b:c`,
      `a ? b : c`,
      `a\n?\nb\n:\nc`,
      `a ? b ? c : d : e`,
      `a ? b : c ? d : e`,

      // ORDER OF OPERATIONS
      `!a ? b : c`,
      `a+b ? c : d`,
      `a*b ? c : d`,
      `a^b ? c : d`,
      `a.b ? c : d`,
      `a and b ? c : d`,
      `a or b ? c : d`,
      `a ? b = c : c = d`,

      // INCOMPLETE
      `a ?`,
      `a ? b`,
      `a ? b c`,
    ];
  }

  class $EXPONENT_ASSIGN extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $TERINARY,

      /^\^=/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // MODULO
      `a^=b`,
      `a ^=b`,
      `a^= b`,
      `a ^= b`,
      `a\n^=\nb`,
      `a^=b^=c`,

      // ORDER OF OPERATIONS
      `!a ^= b`,
      `a ^= !b`,
      `a ^= b?c:d`,
      `a ^= b + c`,
      `a ^= b * c`,
      `a ^= b ^ c`,
      `a.b ^= c.d`,
      `a ^= b..c`,
      `a ^= b and c`,
      `a ^= b or c`,

      // INCOMPLETE
      `a^=`,
    ];
  }
  class $MULTIPLICATIVE_ASSIGN extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $EXPONENT_ASSIGN,

      /^(%=|\/=|\*=)/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // MODULO
      `a%=b`,
      `a %=b`,
      `a%= b`,
      `a %= b`,
      `a\n%=\nb`,
      `a%=b%=c`,

      // DIVIDE
      `a/=b`,
      `a /=b`,
      `a/= b`,
      `a /= b`,
      `a\n/=\nb`,
      `a/=b/=c`,

      // MULTIPLY
      `a*=b`,
      `a *=b`,
      `a*= b`,
      `a *= b`,
      `a\n*=\nb`,
      `a*=b*=c`,

      // ORDER OF OPERATIONS
      `!a *= b`,
      `a *= !b`,
      `a *= b ^= c`,
      `a *= b?c:d`,
      `a *= b + c`,
      `a *= b * c`,
      `a *= b ^ c`,
      `a.b *= c.d`,
      `a *= b..c`,
      `a *= b and c`,
      `a *= b or c`,

      // INCOMPLETE
      `a*=`,
    ];
  }
  class $ADDITIVE_ASSIGN extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $MULTIPLICATIVE_ASSIGN,

      /^(-=|\+=)/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // SUBTRACT
      `a-=b`,
      `a -=b`,
      `a-= b`,
      `a -= b`,
      `a\n-=\nb`,
      `a-=b-=c`,

      // ADD
      `a+=b`,
      `a +=b`,
      `a+= b`,
      `a += b`,
      `a\n+=\nb`,
      `a+=b+=c`,

      // ORDER OF OPERATIONS
      `!a += b`,
      `a -= !b`,
      `a += b *= c`,
      `a += b ^= c`,
      `a += b?c:d`,
      `a += b + c`,
      `a += b * c`,
      `a += b ^ c`,
      `a.b += c.d`,
      `a += b..c`,
      `a += b and c`,
      `a += b or c`,

      // INCOMPLETE
      `a+=`,
    ];
  }
  class $ASSIGN extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $ADDITIVE_ASSIGN,

      /^=(?!=)/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // ASSIGN
      `a=b`,
      `a =b`,
      `a= b`,
      `a = b`,
      `a\n=\nb`,
      `a=b=c`,

      // ORDER OF OPERATIONS
      `a = b += c`,
      `a = b *= c`,
      `a = b ^= c`,
      `!a = b`,
      `a = !b`,
      `a = b + c`,
      `a = b * c`,
      `a = b ^ c`,
      `a = b .. c`,
      `a = b?c:d`,

      // INCOMPLETE
      `a=`,
    ];
  }
  class $RETURN extends $AST {
    static SHAPE = new Shape(
      /^return\b/,
      {
        s:
          $s.KEYWORD +
          `inlineb p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) fs:0.9em r:0.33em`,
      },

      $ASSIGN,
      { min: 0 }
    );
    static SAMPLES = [
      `return`,
      `return a`,
      `return\na`,

      // // ORDER OF OPERATIONS
      `return !a`,
      `return a=b`,
      `return a+b`,
      `return a*b`,
      `return a^b`,
      `return a==b`,
      `return a and b`,
      `return a or b`,
      `return a..b`,
    ];
  }

  $CODE_EXP.SHAPE = new Shape([$COMMENT, $RETURN, $ASSIGN]);
  $CODE_LINE_TOKENS.SHAPE = new Shape([], { min: 0, max: Infinity }, "\n");

  // -------------------------- #$STYLE --------------------------
  // redesign the style system to integrate events, pseudos, attributes, etc.
  class $STYLE_EXP extends $EXP {}
  class $STYLE extends $AST {
    static SHAPE = new Shape([$STYLE_EXP, $UNKNOWN], { min: 0, max: Infinity });
    static SAMPLES = [
      `
--primary-color:#3498db
--secondary-color:#2ecc71
--background-color:#ecf0f1
--text-color:#2c3e50
--transition-speed:0.3s

--sm:100px
--md:250px
--lg:500px

--full:100%
--dynamic:flex

@slide-away( 1s |50%| ml:200px )
`,
      `
bg:--background-color fc:--text-color
ff:"Arial, sans-serif"
m:0 pl:pr:20px bg:(2px solid red) tf:(scale(1) rotate(360deg))
    `,
      `
w:200px h:300vh |w:500px H:20% :hover| c:pointer

|mouseleave| fc:purple

|:hover|
bg:--secondary-color
w:200px
    `,
      `
ml:mt:mr:calc(20% + 50px / 200rem)
@(
2s ease-in-out 1s infinite alternate both
|start| w:10px h:50px
|50%| bg:red
|end| w:20px
)
  `,

      // INVALID
      `
  5400
          `,
    ];
  }
  window.$STYLE = $STYLE;

  class $STYLE_VALUE extends $EXP {}

  class $STYLE_PORTAL extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      `'`,
      { s: $s.OP },

      [$STYLE_EXP, $UNKNOWN],
      { min: 0, max: Infinity },

      `'`,
      { s: $s.OP }
    );
    static SAMPLES = [
      `''`,
      `'a'`,
      `'a b'`,
      `'\na\nb\n'`,

      // INCOMPLETE
      `'`,

      // $UNKNOWN
      `'%'`,
    ];
  }

  class $MEASUREMENT extends $AST {
    static SHAPE = new Shape(/^-?\d*\.?\d+[a-zA-Z%]*/, { s: $s.NUMBER });
    static SAMPLES = ["553", "0px", "1.5em", "-2rem", "20%"];
  }
  class $PSEUDO extends $AST {
    static SHAPE = new Shape(/^::?[a-zA-Z]+(-[a-zA-Z]+)*(\([^)]*\))?/, {
      s: $s.IDENTIFIER,
    });
    static SAMPLES = [
      // Pseudo-classes
      ":hover",
      ":active",
      ":first-child",
      ":nth-child(n)",
      ":nth-last-child(n)",
      ":lang(language)",

      // Pseudo-elements
      "::before",
      "::after",
      "::first-line(num)",
    ];
  }
  class $STYLE_IDENTIFIER extends $AST {
    static SHAPE = new Shape(/^(--)?[a-zA-Z][a-zA-Z0-9-_]*/, {
      s: $s.IDENTIFIER,
    });
    static SAMPLES = [
      // Simple Identifiers
      "word",
      "hyphenated-word",
      "multi-hyphenated-word",
      "AnotherExample",
      "with-Multiple-hyphens",
      "CapitalWord",
      "mixedCaseWord",
      "longer-hyphenated-Example",
    ];
  }

  class $HEX_COLOR extends $AST {
    static SHAPE = new Shape(
      /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/,
      { s: $s.NUMBER }
    );
    static SAMPLES = [
      "#fff",
      "#000",
      "#1234",
      "#abcd",
      "#123abc",
      "#AABBCC",
      "#12345678",
      "#abcdef12",
    ];
  }
  class $STRING extends $AST {
    static SHAPE = new Shape(/^"([^"\\]*(\\.[^"\\]*)*)"/, { s: $s.STRING });
    static SAMPLES = [`"abc"`, `"a\\"b\\"c"`];
  }

  class $PARENTHESIZED_STYLE_VALUES extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      `(`,
      { s: $s.OP },

      () => $STYLE_VALUE,
      { min: 0, max: Infinity },

      `)`,
      { s: $s.OP }
    );
    static SAMPLES = [
      `(a)`,
      `(\na\n)`,
      `(a b c)`,

      // INCOMPLETE
      `(`,
    ];
  }

  class $STYLE_FUN_CALL extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $STYLE_IDENTIFIER,

      `(`,
      { s: $s.OP },

      new Shape(() => $STYLE_VALUE, `,`, { min: 0, s: $s.OP }),
      { min: 0, max: Infinity },

      `)`,
      { s: $s.OP }
    );
    static SAMPLES = [
      `a()`,
      `a(b)`,
      `a(b, c, d)`,
      `calc(a - b)`,
      `calc(a - calc(b * c))`,
      `calc(20% + 50px / 200rem)`,

      // INCOMPLETE
      `a(`,
    ];
  }

  class $STYLE_MULTIPLICATIVE extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      [$STYLE_FUN_CALL, $HEX_COLOR, $STRING, $STYLE_IDENTIFIER, $MEASUREMENT],

      /^(\/(?!=|\/)|\*(?!=))/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // DIVIDE
      `a/b`,
      `a /b`,
      `a/ b`,
      `a / b`,
      `a\n/\nb`,
      `a/b/c`,

      // MULTIPLY
      `a*b`,
      `a *b`,
      `a* b`,
      `a * b`,
      `a\n*\nb`,
      `a*b*c`,

      // INCOMPLETE
      `a*`,
    ];
  }
  class $STYLE_ADDITIVE extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $STYLE_MULTIPLICATIVE,

      /^(-(?!=|-)|\+(?!=|\+))/,
      { s: $s.OP },

      this
    );
    static SAMPLES = [
      // SUBTRACT
      `a - b`,
      `a\n-\nb`,
      `a - b - c`,

      // ADD
      `a+b`,
      `a +b`,
      `a+ b`,
      `a + b`,
      `a\n+\nb`,
      `a+b+c`,

      // ORDER OF OPERATIONS
      `a + b * c`,

      // INCOMPLETE
      `a+`,
    ];
  }

  class $ANIMATION extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      new RegExp(`^@(${$STYLE_IDENTIFIER.SHAPE[0].value.source})?\\(`),
      { s: $s.OP },

      [$COMMENT, $CODE_PORTAL, $MEASUREMENT, $STYLE_IDENTIFIER],
      { min: 0, max: Infinity },

      $STYLE_EXP,
      { min: 0, max: Infinity },

      ")",
      { s: $s.OP }
    );
    static SAMPLES = [
      "@()",
      "@myAnimation()",
      `@fade(
    2s ease-in-out 1s infinite alternate both
    |start| w:10px h:50px
    |50%| bg:red
    |end| w:20px
  )`,

      // INCOMPLETE
      `@(`,
    ];
  }

  class $STYLE_ATTR extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape(
      $STYLE_IDENTIFIER,

      ":",
      { s: $s.OP },

      [() => $STYLE_ATTR_NESTED, $STYLE_VALUE]
    );
    static SAMPLES = [
      `a:b`,
      `a:b`,
      `a:b:c`,
      `a:b:calc(20% + 50px / 200rem)`,

      // INCOMPLETE
      `a:`,
    ];
  }
  class $STYLE_ATTR_NESTED extends $STYLE_ATTR {
    static fallbackToFirstExp = false;
  }

  class $STYLE_QUERY extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      "|",
      { s: $s.OP },

      [$MEASUREMENT, $STYLE_ATTR, $PSEUDO, $STYLE_IDENTIFIER],
      { min: 0, max: Infinity },

      "|",
      { s: $s.OP }
    );
    static SAMPLES = [
      "|a|",
      "|a b|",
      `
  |
    :selected
    flex
  |
      `,

      // INCOMPLETE
      `|`,
    ];
  }

  $STYLE_EXP.SHAPE = new Shape([
    $ANIMATION,
    $COMMENT,
    $CODE_PORTAL,
    $STYLE_QUERY,
    $STYLE_ATTR,
  ]);
  $STYLE_VALUE.SHAPE = new Shape([
    $COMMENT,
    $CODE_PORTAL,
    $PARENTHESIZED_STYLE_VALUES,
    $ANIMATION,
    $STYLE_ADDITIVE,
  ]);

  // -------------------------- #$MARKUP --------------------------
  class $MARKUP_EXP extends $EXP {}
  class $MARKUP extends $AST {
    static SHAPE = new Shape([$MARKUP_EXP, $UNKNOWN], {
      min: 0,
      max: Infinity,
    });
    static SAMPLES = [
      `
    ## Employee Information Table

    The table below lists all of the \\iemployees\\i in the west coast office. The table is broken down into the following categories:

    1. Employee ID
    2. Name
    3. Position
    4. Department
    5. Location

    #|: Employee ID |: Name :|: Position :|: Department :|: Location :|
    | 001 | John Doe | Software Engineer | Development | New York |
    | 002 | Jane Smith | Project Manager | Project Management | San Francisco |
    | 003 | Mike Johnson | UX Designer | Design | Austin |
    | 004 | Emily Davis | DevOps Engineer | Operations | Seattle |
    | 005 | Alex Garcia | Data Analyst | Data Science | Boston |
    | 006 | Samantha Brown | Product Manager | Product | Denver |
    | 007 | Christopher Wilson | QA Engineer | Quality Assurance | Chicago |
    | 008 | Jessica Martinez | Frontend Developer | Development | New York |
    | 009 | Daniel Taylor | Backend Developer | Development | San Francisco |
    | 010 | Laura Anderson | Cloud Architect | Cloud Services | Austin |
    | 011 | Ryan White | Security Analyst | Security | Seattle |
    | 012 | Chloe Green | Database Administrator | Database | Boston |
    | 013 | Benjamin King | Mobile Developer | Development | Denver |
    | 014 | Sophia Hall | Content Strategist | Marketing | Chicago |
    | 015 | Ethan Thompson | Graphic Designer | Design | New York |
    | 016 | Olivia Lewis | HR Manager | Human Resources | San Francisco |
    | 017 | Mason Young | Financial Analyst | Finance | Austin |
    | 018 | Ava Hill | Customer Support Specialist | Support | Seattle |
    | 019 | Noah Scott | Systems Administrator | IT | Boston |
      `,
      `
    # Comprehensive List Example

    - Main Topic 1
    - Subtopic A
      - Detail 1
      - Detail 2
    - Subtopic B
      - Detail 1
      - Detail 2
        - Sub-detail a
        - Sub-detail b
    - Main Topic 2
    1. Subtopic A
      1. Detail 1
      2. Detail 2
          a. Sub-detail a
          b. Sub-detail b
    2. Subtopic B
      1. Detail 1
      2. Detail 2
    - Main Topic 3
    a. Subtopic A
      1. Detail 1
          a. Sub-detail a
          b. Sub-detail b
      2. Detail 2
    b. Subtopic B
      - Detail 1
      - Detail 2
      `,
      `
    ## Tasks to Complete

    [ ] Complete the initial project setup @[Setup Guide | https://example.com/setup-guide]
    [x] Review project requirements @[Requirements Document | https://example.com/requirements]
    [ ] Design the application architecture ![Architecture Diagram | architecture-diagram.png]
    [x] Set up the development environment %[@Development Environment Setup Video | setup-video.mp4]
    [ ] Implement the login functionality &[@API Documentation | https://api.example.com/documentation]
    [ ] Conduct initial testing #[Testing Tools | https://example.com/testing-tools]
    [x] Schedule project kickoff meeting @[Meeting Scheduler | https://calendar.example.com]
      `,
      `
    # Factorial Function Documentation

    The factorial of a non-negative integer \\cn\\c is the product of all positive integers less than or equal to \\cn\\c. It is denoted by \\cn!\\c.

    ## Syntax

    '''
    factorial = fun n:
      if n == 0:
          return 1
      else
          return n * factorial(n-1)
    '''

    ## Usage Example

    To calculate the factorial of 5, you would call the function as follows:

    '''
    result = factorial(5)
    '''

    This will calculate the factorial of 5. The expected result is:

    Today's result is {120}

    > \\bNote:\\b The factorial function is a classic example of a recursive function, a function that calls itself.

    ---

    ## Understanding Recursion

    Recursion is a fundamental concept in computer science, where a function calls itself to solve a problem. A base case is essential to prevent infinite recursion.

    ---
      `,
      `
    ## Puppies are cute

    Have you ever thought that puppies are just the most adorable things on the planet! Here's a list of resources about cute puppies:

    $nav 'bg:#3498db fc:white p:10px flex space-between'
      $logo src:\`logo.png\` alt:\`Company Logo\` 'h:50px'
      $link href:\`#home\` 'Home'
      $link href:\`#about\` \`About\`
      $link href:\`#contact\` \`Contact\`

    If you find these links useful, please check out more at @[ cute puppies | cutepuppies.com ]
      `,
    ];
  }
  class $MARKUP_PORTAL extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      "`",
      { s: $s.STRING },

      [$MARKUP_EXP],
      { min: 0, max: Infinity, s: $s.STRING },

      "`",
      { min: 0, s: $s.STRING }
    );
    static s = $s.STRING;
    static SAMPLES = [
      "``",
      "`a\\r`",

      // INCOMPLETE
      "`",
    ];
  }

  class $ESCAPED_CHAR extends $AST {
    static SHAPE = new Shape(/^\\[^\s\n]/, { s: $s.COMMENT });
    static SAMPLES = [
      "\\a",
      "\\t",
      "\\n",
      '\\"',
      "\\'",
      "\\\\",
      "\\$",
      "\\%",
      "\\_",
      "\\{",
      "\\}",
      "\\[",
      "\\]",
      "\\:",
      "\\;",
      "\\!",
      "\\@",
      "\\#",
      "\\&",
      "\\*",
    ];
  }
  class $HORIZONTAL_RULE extends $AST {
    static SHAPE = new Shape(/^---\s*(\n|$)/, { s: $s.COMMENT });
    static SAMPLES = ["---", "---\n"];
  }

  class $PARAGRAPH extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      [
        $ESCAPED_CHAR,
        $CODE_PORTAL,
        () => $LINK,
        /(?:(?!\\[^\s\n]|{|`|[@!%&#]\[).)+/,
      ],
      { min: 1, max: Infinity },

      /(\n|$)+/
    );
    static SAMPLES = [
      `hello world`,
      `hello {name} how are \\byou \\i doing \\b {exp} is cool`,
      `hello, please click on @[dog|cat] to see the homepage`,
    ];
  }

  class $LINK extends $AST {
    static SHAPE = new Shape(
      /^(@|!|%|&|#)\[/,
      { s: $s.OP },

      [$ESCAPED_CHAR, $CODE_PORTAL, /^(?:(?!\\[^\s\n]|{|`|\|).)+/],
      { max: Infinity },

      "|",
      { s: $s.OP },

      [$ESCAPED_CHAR, /^(?:(?!\\[^\s\n]|{|`|\]).)+/],
      { max: Infinity, s: $s.OP },

      "]",
      { s: $s.OP }
    );
    static SAMPLES = [
      // URL
      `@[dog|cat]`,
      `@[google's homepage| www.google.com]`,
      `@[some \\b {code} text | www.google.com]`,

      // IMAGE
      `![dog|cat]`,
      `![google's homepage| www.google.com]`,
      `![some \\b {code} text | www.google.com]`,

      // VIDEO
      `%[dog|cat]`,
      `%[google's homepage| www.google.com]`,
      `%[some \\b {code} text | www.google.com]`,

      // AUDIO
      `&[dog|cat]`,
      `&[google's homepage| www.google.com]`,
      `&[some \\b {code} text | www.google.com]`,

      // IFRAME
      `#[dog|cat]`,
      `#[google's homepage| www.google.com]`,
      `#[some \\b {code} text | www.google.com]`,
    ];
  }

  class $LIST_ITEM extends $AST {
    static SHAPE = new Shape(
      /^(-|\w*\.) /,
      { s: $s.OP },

      $PARAGRAPH
    );
    static SAMPLES = [`- a`, `a. b`, `1. a`, `  - a`];
  }
  class $CHECKBOX extends $AST {
    static SHAPE = new Shape(
      /^\[[\w ]\] /,
      { s: $s.OP },

      $PARAGRAPH
    );
    static SAMPLES = [`[ ] a`, `[a] b`, `[a] w\\world`, `[ ] cool`];
  }
  class $BLOCKQUOTE extends $AST {
    static SHAPE = new Shape(
      "> ",
      { s: $s.OP },

      $PARAGRAPH,
      { s: `fst:italic` }
    );
    static SAMPLES = [`> a`];
  }
  class $HEADING extends $AST {
    static SHAPE = new Shape(
      /^#+ /,
      { s: $s.OP },

      $PARAGRAPH
    );
    static SAMPLES = [
      `# a`,
      `# heading`,
      `## heading`,
      `### heading`,
      `#### heading`,
      `##### he\\gadi\\gng`,
      `###### heading`,
    ];
  }

  class $DISPLAY_CODE extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 1;
    static SHAPE = new Shape(
      `"""`,
      { s: $s.OP },

      $CODE_EXP,
      { min: 0, max: Infinity },

      `"""`,
      { s: $s.OP }
    );
    static SAMPLES = [
      `"""a"""`,
      `
"""
a
b
"""
`,
    ];
  }

  class $TABLE_ROW extends $AST {
    static SHAPE = new Shape(
      /^#?\|:?/,
      { s: $s.OP },

      new Shape(
        [$ESCAPED_CHAR, /^(?:(?!\\[^\s\n]|[@!%&#]\[|{|`|\||:\||\|:|:\|:).)+/],
        { max: Infinity },

        /^:?\|:?/,
        { s: $s.OP }
      ),
      { min: 0, max: Infinity },

      `\n`,
      { min: 0 }
    );
    static SAMPLES = [
      `|hi|`,
      `|a|b|c|`,
      `|: content 1 |: hea__din__g2 |: hello there 3 |`,
      `|: hebad**ing** 1 :| hi | lil nepotiz 3 :|`,

      // TABLE_HEADING_ROW
      `#| hi |`,
    ];
  }

  $MARKUP_EXP.SHAPE = new Shape([
    $CODE_PORTAL,
    () => $ELEMENT,
    $HORIZONTAL_RULE,
    $LINK,
    $ESCAPED_CHAR,
    $LIST_ITEM,
    $CHECKBOX,
    $BLOCKQUOTE,
    $HEADING,
    $DISPLAY_CODE,
    $TABLE_ROW,
    $PARAGRAPH,
  ]);

  // -------------------------- #$ELEMENT --------------------------

  class $ELEMENT_EXP extends $EXP {}
  class $ELEMENT_EXP_BLOCK extends $INDENT_BLOCK {
    static SHAPE = new Shape([$ELEMENT_EXP, $UNKNOWN]);
  }
  class $ELEMENT extends $AST {
    static SHAPE = new Shape(
      /^\$([a-zA-Z_][a-zA-Z0-9-_]*)?/,
      { s: $s.ELEMENT },

      $ELEMENT_EXP,
      { min: 0, max: Infinity },

      /^ *\n/,
      { min: 0, max: 0 },

      $ELEMENT_EXP_BLOCK,
      { min: 0 },

      `)`,
      { min: 0, max: 0 }
    );
    static SAMPLES = [
      `$`,
      `
$html lang:\`en\`
  $head
    $meta charset:\`UTF-8\`
    $meta httpequiv:\`X-UA-Compatible\` content:\`IE=edge\`
    $meta name:\`viewport\` content:\`width=device-width, initial-scale=1.0\`
    $title \`Sample Webpage\`
    $link rel:\`stylesheet\` href:\`styles.css\`
    $script src:\`script.js\` ::defer
  $body
    $header
      $nav
        $ul
          $li $a href:\`/\` \`Home\`
          $li $a href:\`/about\` \`About\`
          $li w:\`100px\` ::visited $a href:\`/contact\` \`Contact\`
      $h1 \`Welcome to My Website\`
    $main
      $nav_bar '{s}'
        $img src:\`logo.png\` 'w:75px ml:1em mb:2em'
    
      $active_items
        $active_sprint 'mb:.5em' {activeSprint.name}
        $backlog \`backlog\`
      $separator 'mt:.5em mb:.5em b:(1px solid --text-accent)'
      $projects
        $section-heading 'fc:--text-accent mb:.5rem' \`PROJECTS\`
        $list _:{projects}
          {fun project: ($\{Project.ListItem} ::project)}
      $separator 'mt:.5em mb:.5em b:(1px solid --text-accent)'
      $sprints
        $section-heading 'fc:--text-accent mb:.5rem' \`SPRINTS\`
        $list _:{sprints.reverse()}
          {fun sprint: ($\{Sprint.ListItem} ::sprint)}
      $section id:\`intro\`
        \`Welcome! This is a sample website. Here's a brief intro about our website.\`
        $a href:\`/learn-more\` \`Learn more\`
      $section id:\`features\`
        $h2 \`Features\`
        $ul
          $li \`Responsive Design\`
          $li \`High-quality Content\`
          $li \`Interactive Elements\`
      $section id:\`subscribe\`
        $h2 \`Subscribe\`
        $form action:\`/subscribe\` method:\`post\`
          $label for:\`email\` \`Email:\`
          $input type:\`email\` id:\`email\` placeholder:\`Enter your email\`
          $button type:\`submit\` \`Subscribe\`
    $footer
      \`© 2023 My Website. All rights reserved.\`
    `,
    ];
  }

  class $ELEMENT_BOOLEAN_ATTR extends $AST {
    static SHAPE = new Shape(/^::[a-zA-Z][a-zA-Z0-9-_]*/);
    static SAMPLES = [
      "::first-child",
      "::hover",
      "::active",
      "::li-padded",
      "::custom-element",
      "::element-1",
      "::element_with_underscore",
      "::a1",
      "::B2",
    ];
  }
  class $ELEMENT_ATTR extends $AST {
    static allowIncompleteParse = true;
    static incompleteParseThreshold = 2;
    static SHAPE = new Shape($IDENTIFIER, ":", [
      $MARKUP_PORTAL,
      $CODE_PORTAL,
      $STYLE_PORTAL,
      $ELEMENT_ATTR,
      $IDENTIFIER,
    ]);
    static SAMPLES = [
      `a:b`,
      `a :b`,
      `a: b`,
      `a : b`,
      `a\n:\nb`,
      `a:b:c`,

      // INCOMPLETE
      `a:`,
    ];
  }

  $ELEMENT_EXP.SHAPE = new Shape([
    $ELEMENT,
    $CODE_PORTAL,
    $STYLE_PORTAL,
    $MARKUP_PORTAL,
    $ELEMENT_BOOLEAN_ATTR,
    $ELEMENT_ATTR,
  ]);

  window.useCodeParser = (code, $ = $CODE) => {
    const parser = new Lexer(code);
    const $ast = $.parse(parser);
    // console.log($ast);
    // $ast && $ast.format();
    return $ast;
  };

  useTests("Hippie ASTs", () => {
    let debug = false;
    let OPS = [
      // $CODE
      {
        root: $CODE,
        asts: [$CODE],
        // onlyAST: $PARENTHESIZED_CODE_EXP,
        // only: true,
      },
      // $CODE_EXP
      {
        root: $CODE_EXP,
        asts: [
          $RETURN,
          $PARENTHESIZED_CODE_EXP,
          $CODE_PORTAL,
          $MARKUP_PORTAL,
          $ASSIGN,
          $ADDITIVE_ASSIGN,
          $MULTIPLICATIVE_ASSIGN,
          $EXPONENT_ASSIGN,
          $NEGATION,
          $TERINARY,
          $LOGICAL_AND,
          $LOGICAL_OR,
          $RANGE,
          $COMPARISON,
          $ADDITIVE,
          $MULTIPLICATIVE,
          $EXPONENT,
          $INDEX,
          $FUN_CALL,
          $FIELD,
          $LIST,
          $FUN,
          $SWITCH,
          $IF,
          $ELIF,
          $ELSE,
          $FOR,
          $DO_WHILE,
          $WHILE,
          $NUMBER,
          $COMMENT,
          $BOOLEAN,
          $KEYWORD,
          $IDENTIFIER,
        ],
        // onlyAST: $IF,
        // only: true,
      },
      // $STYLE
      {
        root: $STYLE,
        asts: [$STYLE],
        // onlyAST: $PARENTHESIZED_CODE_EXP,
        // only: true,
      },
      // $STYLE_EXP
      {
        root: $STYLE_EXP,
        asts: [$COMMENT, $CODE_PORTAL, $STYLE_QUERY, $ANIMATION, $STYLE_ATTR],
        // onlyAST: $COMMENT,
        // only: true,
      },
      // $STYLE_VALUE
      {
        root: $STYLE_VALUE,
        asts: [
          $COMMENT,
          $CODE_PORTAL,
          $ANIMATION,
          $PARENTHESIZED_STYLE_VALUES,
          $STYLE_ADDITIVE,
          $STYLE_MULTIPLICATIVE,
          $STYLE_FUN_CALL,
          $STYLE_IDENTIFIER,
          $HEX_COLOR,
          $STRING,
          $MEASUREMENT,
        ],
        // onlyAST: $STYLE_ATTR,
        // only: true,
      },
      // $MARKUP
      {
        root: $MARKUP,
        asts: [$MARKUP],
        // onlyAST: $PARENTHESIZED_CODE_EXP,
        only: false,
      },
      // $MARKUP_EXP
      {
        root: $MARKUP_EXP,
        asts: [
          $CODE_PORTAL,
          $HORIZONTAL_RULE,
          $LINK,
          $LIST_ITEM,
          $CHECKBOX,
          $ELEMENT,
          $BLOCKQUOTE,
          $HEADING,
          $DISPLAY_CODE,
          $TABLE_ROW,
          $PARAGRAPH,
        ],
        // onlyAST: $PARAGRAPH,
        // only: true,
      },
      // $ELEMENT_EXP
      {
        root: $ELEMENT_EXP,
        asts: [
          $ELEMENT,
          $CODE_PORTAL,
          $STYLE_PORTAL,
          $MARKUP_PORTAL,
          $ELEMENT_BOOLEAN_ATTR,
          $ELEMENT_ATTR,
        ],
        // onlyAST: $PARAGRAPH,
        only: false,
      },
    ];

    if (OPS.find((op) => op.only)) OPS = OPS.filter((op) => op.only);
    for (let { root, exp, asts: _asts, onlyAST, name } of OPS.filter(
      (op) => !op.skip
    )) {
      let asts = onlyAST ? useArray(onlyAST) : _asts;

      for (const $ of asts) {
        it($.name, () => {
          for (const sample of useFunction($.SAMPLES)($) || []) {
            let $ast = useCodeParser(sample, root);
            // console.log($ast);
            // if ($ast) $ast = $ast.exps[0];
            debug && console.log("TEST_AST", root);
            const testResult = $ast instanceof $ && $ast.text === sample;
            if (!testResult)
              console.log(
                `SOURCE: "${sample}"\nRESULT: "${$ast && $ast.text}"\n`,
                $ast
              );
            assert(testResult, `${sample}`);
          }
        });
      }
    }
  });

  useTests("Hippie AST Integration", () => {
    it("renders deeply nested structures", () => {
      const $ = $CODE.parse(new Lexer(`a+b-c`));

      assert($.exps.length === 1);
      assert($.exps[0] instanceof $ADDITIVE);
      assert($.exps[0].exps[2] instanceof $ADDITIVE);
      assert($.text === "a+b-c");
    });
  });

  useTests("   $AST performance test", () => {
    it("goes fast", async () => {
      const start = performance.now();
      const s = `
      ## Employee Information Table

      The table below lists all of the \\iemployees\\i in the west coast office. The table is broken down into the following categories:

      1. Employee ID
      2. Name
      3. Position
      4. Department
      5. Location

      {
        if dog == mouse:
            if cat == car:
              if thisIsCool:
                print(\`optimizations are cool\\n and all\`)
                but = that
          for cat in [0..1000]:
            finny = \`super cute puppy\`
            if finny.isCute(puppy):
              doCuteThing()
            else beCute()
            dog = cat + rhino - squirrel
            if dog == mouse:
              if cat == car:
                if thisIsCool:
                  print(\`optimizations are cool\\n and all\`)
                  but = that
                  dog = cat + rhino - squirrel
                  if dog == mouse:
                    if cat == car:
                      if thisIsCool:
                        print(\`optimizations are cool\\n and all\`)
                        but = that
                        dog = cat + rhino - squirrel
                        if dog == mouse:
                          if cat == car:
                            if thisIsCool:
                              print(\`optimizations are cool\\n and all\`)
                              but = that
                              if dog == mouse:
                                if cat == car:
                                  if thisIsCool:
                                    print(\`optimizations are cool\\n and all\`)
                                    but = that
                                    dog = cat + rhino - squirrel
                                    if dog == mouse:
                                      if cat == car:
                                        if thisIsCool:
                                          print(\`optimizations are cool\\n and all\`)
                                          but = that
                                          dog = cat + rhino - squirrel
                                          if dog == mouse:
                                            if cat == car:
                                              if thisIsCool:
                                                print(\`optimizations are cool\\n and all\`)
                                                but = that
                                          for cat in [0..1000]:
                                            finny = \`super cute puppy\`
                                            if finny.isCute(puppy):
                                              doCuteThing()
                                            else beCute()
                                    for cat in [0..1000]:
                                      finny = \`super cute puppy\`
                                      if finny.isCute(puppy):
                                        doCuteThing()
                                      else beCute()
                        for cat in [0..1000]:
                          finny = \`super cute puppy\`
                          if finny.isCute(puppy):
                            doCuteThing()
                          else beCute()
                  for cat in [0..1000]:
                    finny = \`super cute puppy\`
                    if finny.isCute(puppy):
                      doCuteThing()
                    else beCute()
            for cat in [0..1000]:
              finny = \`super cute puppy\`
              if finny.isCute(puppy):
                doCuteThing()
              else beCute()
        }

        cat
                `.repeat(100);

      const times = [];

      console.log("chars:", s.length, "\nlines:", s.split("\n").length);
      const ast = useState(useCodeParser(s, $MARKUP));
      console.log("time to parse:", performance.now() - start);
      console.log(times.map((t) => t.msToparse).join("\n"));
      assert(ast.text === s);
    });
  });
});
