# Hippie Programming Language (.hip)

THIS DOCUMENT IS A WORK IN PROGRESS, SEE parser.js FOR MORE INFO.

TODO: types, error handling, code generation

hippie is a statically typed, general purpose programming language with a focus on human readability, code consistancy and a non-intrusive type system. hippie syntax is designed to be visually appealing and includes as few "built-in" language features/keywords as possible.

Out of the box hippie supports 4 basic data types:

- **Number**: 64 bit floating point
- **String**: group of utf-8 (8 bit interger) characters deliniated by a double quote (") with support for concatenation
- **Boolean**: true/false value
- **Function**: a callable block of code which accepts arguments / returns values (including other functions) and closes around the state in which it's called.

It's possible to expand on these 4 primitive types by creating custom structures **structs** which are more complex types that are composed of these types.

There are also 2 built in data structures:

- **List**: a numerically indexed, dynamically sized collection of one data type, with indexes starting at 0.
- **Map**: a key/value store with string keys and values of one data type

## Numbers

All numbers are 64 bit floating points, meaning they can have decimal places and are big enough to do just about anything a program would need (outside of some very niche use cases).

Numbers can be strung together into mathematical equations which follow the standard order of operations:

- parenthesis: `()`
- exponent: `^`
- multiplication: `*`
- division: `/`
- modulo: `%`
- addition: `+`
- subtraction: `-`

```
1 + 3.5         // 4.5
2 - 10          // -8
5 - -2          // 7
-3 * 5          // -15
100 / -4        // -25
3 ^ 2           // 9
10 % 3          // 1
(4 + 2) * 3.5   // 21
10 % 2 ^ 3      // 2
```

There is also built in support for a wide range of mathematical operations and functions in the standard library.

## Strings

Strings are collections of characters delinated by double quotes. They can grow and shrink dynamically and support concatenation.

```
"hello world"         // hello world
"hello " + "world"    // hello world
"2 + 4 = " + 2 + 4     // 2 + 4 = 6
"hello " + "world"     // hello world
"this is \"quoted\""  // this is "quoted"
"backslash \\"        // backslash \
"new\nline"           // new
                      // line

// interpolation
"today is {getDate()}, {getYear()}. That is a fact"
```

In many cases it is useful to be able to get specific characters or groups of characters out of the string, as well as extract meta-data about the string. Strings are indexed starting at 0 and have a length property which is the number of characters in the string (this starts at 1). So the last character in a string of length 5 will be at index position 4.

Strings can be indexed using square brackets (`[]`) containing either integer numbers, where a negative number represents an index starting from the back of the stirng, or range expressions (outlined below):

```
"hello".len     // 5
"hello"[0]      // h
"hello"[4]      // o
"hello"[-1]     // o
"hello"[-4]     // e
"world"[0..2]   // wo
"world"[0.=2]  // wor
"world"[..2]    // wo
"world"[.=2]   // wor
"world"[1.=3]  // orl
"world"[1..]    // orld
```

It's also possible to find the index of a given substring by indexing with a string. Similarly to the number indexes above, these can start with a negative number which means it will start looking at then end.

```
"hippie"["n"]    // 1
"hippie"[-"n"]   // 6
"hippie"["orn"]  // 4
"hippie"["z"]    // -1
```

## Booleans

Booleans are the simplest data type and are represented by the keywords `true` and `false`:

```
true
false
```

Booleans can be derived from comparisons (boolean expressions) using the 6 comparison operators:

- `<`: less than
- `>`: greater than
- `<=`: less than or equal to
- `>=`: greater than or equal to
- `==`: equal to
- `!=`: not equal to

```
true == true      // true
false != true    // true
5 < 100           // true
50 <= 50          // true
"a" < "b"         // true, compares utf-8 value
(40 + 5) > 200    // false
"dog" != "cat"   // true
4 == (9 - -3)     // false
```

There is also a logical not (`!`) operator which negates a boolean value/expression

```
!true     // false
!!true    // true
!false    // true
!(4 > 5)  // true
```

Booleans and boolean expressions can be chained together using 2 logical operators:

- `&`: **and** operator where both sides must be true for the whole thing to be true
- `|`: **or** operator where only one side must be true for the whole thing to be true

```
true & true       // true
true & false      // false
false & true      // false
false & false     // false

true | true       // true
true | false      // true
false | true      // true
false | false     // false

!(5 > 2) & 3 < 5  // false
```

There is also a terenary expression which allows different values to be returned depending on the result of a boolean expression

```
5 > 2 ? "5 is greater" : "5 is not greater"
```

## Lists

Lists are the simplest data structure, essentially just a sequential collection of a single data type (including other lists). Much like strings, lists of the same type can be concatenated and indexed.

```
[4, 8] + 15             // [4 8 15]
4 + [8, 15]             // [4 8 15]
[4, 8] + [15, 16]       // [4 8 15 16]

[4, 8, 15, 16]
[4, 8, 15, 16][0]       // 4
[4, 8, 15, 16][3]       // 16
[4, 8, 15, 16][-1]      // 16
[4, 8, 15, 16][-3]      // 8
["a", "b", "c"][2]      // "c"

[4, 8, 15, 16][1..3]    // [8 15]
[4, 8, 15, 16][1.=3]   // [8 15 16]
[4, 8, 15, 16][1..]     // [8 15 16]
[4, 8, 15, 16][.=2]    // [4 8 15]
```

In addition to indexing a list, it's also possible to modify values at a given index:

```
[4, 8, 15, 16][1] = 5   // [4 5 15 16]
```

Because list sizes are dynamic, in many cases it won't be known ahead of time whether a given index in the list has a value or not. This situation can be handled using optionals or conditionals.

## Maps

Maps are similar to lists in that they can store a singular data type, but instead of being sequentially indexed by numbers, maps are indexed by strings and their values are in no particular order.

```
event = [ type: "click", id: 3, target: "root" ]

va = "virginia"
state = [
  "pa": "pennsylvania",
  "ny": "new york",
  ca: "california",
  va,
]

states["pa"]            // pennsylvania
states.ny               // new york
states.va = "virginia"  // virginia
```

Lists can actually be though of as a type of specialized map.

## Variables

All data in hippie, including each of the data structures mentioned above, can be stored in a variable for easy labeling and reuse. Variables are named using lowercase letters and multiple words are delineatedByAnUppercase. All names must start with a letter but can be followed by letters, numbers or underscores.

```
name = "Mike"
age = 28 + 1
gpa = 3.9

name = "Finny"
```

## Types

Every piece of data in hippie has a particular type associated to it. There are 4 primitive types which coorispond to the 4 primitive data types

- `:str` - strings
- `:num` - numbers
- `:bol` - booleans
- `:fun()` - functions

The hippie type system can automatically infer the type of a variable based on the value asigned to it. This eliminates the need to explicitly indicate the type. If the variable is assigned to a value of another type, it's type will automatically be updated.

```
name = "finny"    // :str
age = 4           // :num

name = false      // :bol
```

There are also types for the basic data structures which can be combined with the primitive types above:

- `:[str]` - an array of strings
- `:[str bol]` - a map which stores booleans indexed by keys

Just like with primitive types, the type of a data structure can be inferred automatically based on how it's initialized. If the data strucure needs to be initialized without any elements in it, the type can be used to create an empty structure.

```
dogs = ["finny", "gracie"]      // :[str]
cats = [:str]                   // [] - an empty list of strings

states = [
  "pa": "pennsylvania",
  ny: "new york"
]

countries = [:str :num]              // an empty map with number values
```

### Optionals

Types can also be marked as optional, which means they can potentially have no value. This is a special circumstance which needs to be handled with care by the developer. The `?` character can be appended onto the end of the type to indicate that it's optional

- `:str?` - a string which can have no value
- `:[str?]` - a list which has str items but can also have items with no value

```
name = :str?         // optional string with value ?
cats = :[str]?       // optional list of str with value ?
cats = [:str]?       // optional list of str with value []
dogs = [:str?]       // dogs is a list of optional str with value []

cat = :[str]?             // optional map of strings with value ?
cat = [:str :str]         // map of str with value {}
cat = [ dog: "finny" ]?   // optional map of :str


major = "comp sci"?   // major is initialized as a string that can be optional

// changes major's type so that it is not no longer optional `:str?` becomes `:str`
// this is only nescessary when it's already been marked as optional
major!
major = "biology"!

name = "finny"      // now it has a value, but it might not always
```

When working with optionals, you need to handle situations where the value is potentially not present. There are a few ways this can be handled:

```
name = :str?         // ?

name?.len            // if no name this line of code doesn't run
name!.len            // if no name program will crash

name or "no name"     // if name then name, if no name then "no name"
name.len or 5         // when using | operator no need to use ? or !
                     // with the | operator, anything can go on the left side
name and "is name"    // if name then "is name" otherwise ?
name.len and 10000    // if name then 10000 otherwise ?

4 > 8 and 200         // ?
4 > 2 and 200         // 200
```

## Functions

Functions are groups of reusable code which can be called upon to perform specific tasks. Functions can accept data in the form of arguments which can help determine how the function will act. They can also return a piece of data back to the caller. The type of data the function accepts as arguments must be explicitly specified, but the return type can be automatically inferred based on usage.

```
add = fun num1:num, num2:num => num1 + num2
add(num1: 5, num2: 2)

sub = fun num1:num, num2 = 10 =>
  print "subtracting {num2} from {num1}"
  return num1 - num2          // return func will break from the function

result = sub(num1: 5, num2: 10)

mul = fun num1:num, num2:num
  print "multiplying {num1} and {num2}"
  return num1 * num2

// args can have default values
div = fun num1:num, num2 = 1 =>  num1 / num2

// below the parameter `person` is of type `:person`
// so no need to do `person :person`, just use `:person`
print_person = fun :person => print(person)
```

Much like other primitive data types, functions also have a specific type definition. In the case of functions both the arguments as well as the return type (if relevant) need to be specified;

```
:fun()       // a func which no args and return nothing
:fun(num1:num, op:str =>:num)   // a func which takes 2 args and returns a num
:fun(age:num, name:str)       // a func which takes a num and a string w/ a default value and return ?
```

All functions in hippie are higher order, meaning they can accept other functions as arguments and return functions.

```
addEventListener("click", fun e => print()).extend(100)

addEventListener("click", fun e => print())
```

## Structs

While hippie provides a minimal set of primitive, built-in data types and structures, it's also possible to create your own custom types using structs. Structs are type templates which can be reused throughout a program. A basic struct will contain a collection of fields of primitive types of other structs, and instances of them can be created by passing in their relevant fields using the map syntax.

```
:teacher =>
  name:str
  degree:str?          // this is optional and thus not required upon instantiation
  isTenured = false        // default value is set to false
  promote:fun(title:str)

  // any code down here runs when the struct is created, essentially an initializer


teacher1 = :teacher(name: "finny")
teacher2 = :teacher(
  name: "gracie"
  degree: "bachelors"
  is_tenured: true
  promote: (title :str)
    print("promoting to {title}")
)
print(teacher2.name)

:lesson =>
  id:num
  day:date
  topics:[str]

:lessons = [:lesson]

:course =>
  id:num
  name:str
  teacher:teacher      // often times you'll want to do something like this
  :lessons              // if the field name matches the type, just use the type

:group<item, person, u> =>
  items:[item]
  thing:u
  :person

my_group = :group<course, teacher>(
  items: [:course(), :course()]
  thing: :teacher(name: "mike")
)
```

Structs can also contain built in functions (methods), which can access/modify it's fields, these can be public or private, as well as static methods which are contained on the type itself.

```
:element =>
  id:num
  parent:element?
  children = [:element]
  type:str
  _private_field = "dog"
  $static_field = "cat"

  remove_parent = fun => parent = ?

  _private_method = fun =>
    print("calling private method")

  $static_method = fun => print("calling static method")

  // constructor code


e = :element(id: 1, type: "div")
:element.static_field
:element.static_method()

```

Struct methods can access internal struct fields by name. As long as the function is declared inside the struct definition, it will close over the struct's fields and can access them by name. If a function is passed into the struct as a field, it will not close over the struct's fields and thus cannot access them.

## If Statments

hippie programs can respond to their data and make decisions using built in conditional functions:

```
is_tall = true
is_male = true

if is_tall: print("you are tall")
elif is_male:
  print("you are male")
else: print("you are a short non-male")
```

## Switch Statements

switch statments are more specifc types of it statements which allow the programmer to respond to different values in a single expression

```
switch breed:
  case "great dane": print("you're a big doggy")
  case "chiuachua":
    print("you are one dog that is tiniest")
  else: print("aww you're not a breed we recognize, cute mutty!!")
```

## Loops

Loops allows for certain code to be continually executed until a certain condition is met

```
i = 0
while i < 10:
  print(i)
  i += 1

password = "finny"
guess = ""
while guess != password:
  password = input("password: ")

i = 0
do:
  print(i)
  i += 1
while i < 10

break
continue
```

It's also possible to loop over string, lists and maps

```
frields = ["finny", "gracie", "abby"]
for friend, i in friends:
  print("this is the friend: {friend}")

for i in [..friends.len]:
  print("this is the friend: {friends[i]}")

for i in 3:
  print(i)

// for loop with a condition
password = "banana"
guess = ""
for i in 3 & guess != password:
  prompt("please guess")
```

## error handling

TODO

## Text Formatting in Hippie

Hippie introduces a versatile text formatting system that enhances document readability by dividing text into distinct sections and applying various formatters and UI elements. At its core, Hippie allows for the creation of straightforward documents using plain text:

```
Welcome to a Hippie document. This paragraph represents a block of text that extends until a double newline or the end of the document is encountered.

This is a new paragraph. In Hippie, paragraphs continue even after a single newline. A paragraph only ends when a double newline is inserted or when another specific formatter intervenes.
```

Within paragraphs, Hippie offers several formatters to modify text appearance. These formatters are symbols that are typically not used in regular text, making them ideal for our purposes. You can apply these formatters by surrounding the desired text with the corresponding symbol.

### Available Formatters:

- `*` for **bold**
- `^` for _italics_
- `_` for underline
- `~` for ~~strikethrough~~
- `` ` `` for `code`
- `=` for highlighted text
- `&` for hidden text (useful for comments or notes that shouldn't appear in the final output)

Formatters are designed to integrate smoothly with regular text editing, aiming to be minimally intrusive. The effectiveness of a formatter is determined by its context within the text, meaning its position dictates whether it is treated as a formatting tool or as a literal character.

### Examples of Formatter Usage:

```
Some bold text here.

Here, the asterisk does not initiate * bold formatting* due to the space.

In this case, bold formatting ceases here*, so this part isn't bold.

Some bold text starts and ends mid-word.

In this line,* text is not bold, but this part is.

To apply formatting, *an ending symbol is necessary; hence, this part remains unformatted.
```

## Rich Text Editing

hippie supports a rich text format which allows documents of text to be denoted into sections and use explicit types of formatters and ui elements. The simplest version fo this is simply some plain text:

```
hello world this is a document. Starting with a paragraph which is a single block of text up to a double newline or the end of the file.

Here's another paragraph.
a single newline will still count towards the same paragraph. Only when a double newline or a more specific type of formatter is encountered on the new line will the paragraph be terminated.
```

### Formatters

inside of a paragraph you can use formatters to change some basic things about how the text is displayed. The formatters, which are symbols that are not commonly used in plain text, can surround the text you want to format.

The formatters are as follows:

- - bold
- ^ italics
- \_ underline
- ~ strikethrough
- ` code
- = highlighted
- & hidden

Formatters integrate in with normal text editing seamlessly and are designed to be as non-intrusive as possible. A formatter's validity is contextual, the position it's placed in the text determines if it acts as a formatter or simply as it's literal character.

Under hippie conventions, the formatters need to be properly paired and directly adjacent to the text for formatting to apply. Spaces directly after an opening formatter or before a closing formatter typically prevent the formatting from being applied.

`source text` => `bold text`

- `*bold text*` => `bold text`
- `b*old tex*t` => `old tex`
- `*bold *text*` => `bold text`
- `b*old * text*` => `old * text`
- `b*old * *te*xt*` => `old * *te`
- `*bold text` => ``
- `* bold te*xt` => ``

Formatters can also overlap with eachother, you can easily intersperse different formatters together and overlap them:

`source text` => `bold text` => `italicized text`

- `*^hello world^*` => `hello world` => `hello world`
- `*he^llo *^wor^l*d` => `hello *^worl` => `llo *^wor`
- `*he^llo w*or^ld` => `hello w` => `llo wor`
- `he^llo* w*or^ld*` => `orld` => `llo* wor`
- `he^ll^o *w*orld*^` => `w` => `ll`

Each formatter can also be escaped if nescessary using the backslash \*

#### Code Formatter ``

The code formatter is different from the others in that it doesn't adhere to the more strict rules about placement. Because of the nature of this formatter even leading and trailing whitespace is acceptable

- ` hello`
- `he `llo
- ` hello \`

### Links

Often times in text you'll want to link to things or display them for the user, like images, videos, other websites etc. All links are formatted the same way:

- `@[google's homepage | www.google.com]`
- `![image of cute dog | finny.jpg]`
- `%[cool video | /media/my-cool-video.mp4]`
- `&[a sweet audio file | www.amystic.center/tao.mp3]`
- `#[iframe i like | www.flixtor.to/the-office]`

links can be embedded inside a paragraph or as standalone element on a single line, they can also contain formatters within the description portion

```
here is my @[homepage *website* | home.html] that should really look good

![my image | /images/puppy.jpg]

```

## UI Elements

It's possible to display certain ui elements within the rich text document, these are mostly related to formatting and displaying information in ways other than just text.

### Lists

Lists are commonly used to enumerate data is a more clear way, you can use the `- ` character (notice the space) as well as numbers/letters followed by a period and space `1. ` or `a. `.

List items can also be indented

```
- item 1
- item 2
  - item 2.5

1. michael
2. dwight
  a. mose
  b. angela
3. stanley
```

### checkboxes

checkboxes are similar to lists, they can be indented and can be enumerated one after the other. The syntax is two square brackets with a letter inside or not indicating if it's checked.

```
[ ] i agree to recieve marketing emails
[x] i accept the terms and conditions
[a] i am cool
```

In the examples above the last two are checked. Notice how even if it's not checked there still needs to be a space.

### heading

headings are used to denote the start of a section. They use the `#`. The number of `#`s determines the level of the header.

```
# header 1
## header 2
### header 3
```

### code blocks

code blocks are similar to code formatters ``, the can also include the name of the language

```hippie
for i in [..5]: print(i)
```

### blockquote

```
normal text

> blockquote that is displayed differently

more normal text
```

### tables

tables have headers and rows, the headers are denoted by `#|` while the rows just have `|`. The `:` symbol can be used in any cell to indicate alignment. By default all tables are left align, if two colons are places on either side, it's middle, and if one is placed on the right it's right.

```
#|: heading 1 :| hea__din__g2| heading 3 :|
 | content 1 | some cool content 2 | okay nice 3 |

```

### horizontal ruls

`---`

## Styling

Hippie provides a concise, minimal and powerful styling syntax which allows users to build responsive layouts and live updating styles without leaving the language. Styles can be interpolated with code and respond to different situations using queries.

The core of the styling language is the attribute definition, hippie provides a bunch of built in attributes which can be given values

## Markup

Hippie support a markup language similar in spirit to html/swiftUI. It allows programmers to define explicit ui element and reusable components that can take propertes and be styles using the styling language.

The core of the markup language are elemnts, each of which can have a name, properties and then children. All elements are nested in a tree structure denoted by indentation:

```

$nav 'w:100px h:100px'
  `hello world`
  {this is code}


$nav_bar '{s}'
  $img src:`logo.png` 'w:75px ml:1em mb:2em'

  $active_items
    $active_sprint 'mb:.5em' {activeSprint.name}
    $backlog `backlog`
  $separator 'mt:.5em mb:.5em b:(1px solid --text-accent)'
  $projects
    $section-heading 'fc:--text-accent mb:.5rem' `PROJECTS`
    $list _:{projects}
      {fun project: ($Project.ListItem ::project)}
  $separator 'mt:.5em mb:.5em b:(1px solid --text-accent)'
  $sprints
    $section-heading 'fc:--text-accent mb:.5rem' `SPRINTS`
    $list _:{sprints.reverse()}
      {fun sprint: ($Sprint.ListItem ::sprint)}


<nav_bar s={`${s}`}>
  <img src={"logo.png"} s="w:75px ml:1em mb:2em" />

  <active_items>
    <active_sprint s="mb:.5em">{() => activeSprint.name}</active_sprint>

    <backlog>backlog</backlog>
  </active_items>
  <separator s="mt:.5em mb:.5em b:(1px solid --text-accent)" />
  <projects>
    <section-heading s="fc:--text-accent mb:.5rem">
      PROJECTS
    </section-heading>
    <list _={projects}>
      {(project) => <Project.ListItem project={project} />}
    </list>
  </projects>
  <separator s="mt:.5em mb:.5em b:(1px solid --text-accent)" />
  <sprints>
    <section-heading s="fc:--text-accent mb:.5em">SPRINTS</section-heading>
    <list _={sprints.reverse()}>
      {(sprint) => <Sprint.ListItem sprint={sprint} />}
    </list>
  </sprints>
</nav_bar>
```

### Usage in code

Elements can be interpolated into code by using a parenthesis:

```
myElement = ($my-element :isCool 'this is some content')


```

## NOTES

```
$html lang:"en"
  $head
    $meta charset:"UTF-8"
    $meta http-equiv:"X-UA-Compatible" content:"IE=edge"
    $meta name:"viewport" content:"width=device-width, initial-scale=1.0"
    $title Sample Webpage
    $link rel:"stylesheet" href:"styles.css"
    $script src:"script.js" :defer
  $body
    $header
      $nav
        $ul
          $li $a href:"/" Home
          $li $a href:"/about" About
          $li w:"100px" :visited $a href:"/contact" Contact
      $h1 Welcome to My Website
    $main
      $section id:"intro"
        Welcome! This is a sample website. Here's a brief intro about our website.
        $a href:"/learn-more" Learn more
      $section id:"features"
        $h2 Features
        $ul
          $li Responsive Design
          $li High-quality Content
          $li Interactive Elements
      $section id:"subscribe"
        $h2 Subscribe
        $form action:"/subscribe" method:"post"
          $label for:"email" Email:
          $input type:"email" id:"email" placeholder:"Enter your email"
          $button type:"submit" Subscribe
    $footer
      © 2023 My Website. All rights reserved.
```

```
|html| lang:"en"
  |head|
    |meta| charset:"UTF-8"
    |meta| http-equiv:"X-UA-Compatible" content:"IE=edge"
    |meta| name:"viewport" content:"width=device-width, initial-scale=1.0"
    |title| Sample Webpage
    |link| rel:"stylesheet" href:"styles.css"
    |script| src:"script.js" :defer
  |body|
    |header|
      |nav|
        |ul|
          |li| |a| href:"/" Home
          |li| |a| href:"/about" About
          |li| w:"100px" :visited |a| href:"/contact" Contact
      |h1| Welcome to My Website
    |main|
      |section| id:"intro"
        Welcome! This is a sample website. Here's a brief intro about our website.
        |a| href:"/learn-more" Learn more
      |section| id:"features"
        |h2| Features
        |ul|
          |li| Responsive Design
          |li| High-quality Content
          |li| Interactive Elements
      |section| id:"subscribe"
        |h2| Subscribe
        |form| action:"/subscribe" method:"post"
          |label| for:"email" Email:
          |input| type:"email" id:"email" placeholder:"Enter your email"
          |button| type:"submit" Subscribe
    |footer|
      © 2023 My Website. All rights reserved.
```

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Webpage</title>
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
        <h1>Welcome to My Website</h1>
    </header>
    <main>
        <section id="intro">
            <p>Welcome! This is a sample website. Here's a brief intro about our website.</p>
            <a href="/learn-more">Learn more</a>
        </section>
        <section id="features">
            <h2>Features</h2>
            <ul>
                <li>Responsive Design</li>
                <li>High-quality Content</li>
                <li>Interactive Elements</li>
            </ul>
        </section>
        <section id="subscribe">
            <h2>Subscribe</h2>
            <form action="/subscribe" method="post">
                <label for="email">Email:</label>
                <input type="email" id="email" placeholder="Enter your email">
                <button type="submit">Subscribe</button>
            </form>
        </section>
    </main>
    <footer>
        <p>© 2023 My Website. All rights reserved.</p>
    </footer>
</body>
</html>

```

# TODO LIST APP

```



$App = fun:
  tasks = []
  filter = `all`

  addTask = fun task:
    if task:
      newTask = [ id: Date.now(), text: task, completed: false ]
      tasks += newTask

  toggleTask = fun id:
    tasks = tasks.map(fun task:
      task.id === id ? [ ..task, completed: !task.completed ] : task
    )

  filteredTasks = tasks.filter(fun task:
    if filter == `completed` return task.completed
    if filter == `active` return !task.completed
    return true
  )

  $div 'ta:center maxw:600px m:auto'
    $h1 `Todo List`
    $TaskInput :addTask
    $TaskList tasks:{filteredTasks}
    $div
      $button onClick:{fun: setFilter(`all`)} `All`
      $button onClick:{fun: setFilter(`active`)} `Active`
      $button onClick:{fun: setFilter(`completed`)} `Completed`


$TaskInput = fun [ :addTask ]:
  input = ``

  handleSubmit = fun e:
    e.preventDefault()
    addTask(input)
    input = ``

  $form onSubmit:{handleSubmit}
    $input
      type:`text`
      value:{input}
      onChange:{fun e: setInput(e.target.value)}
      palceholder:`Add a new task`

$TaskList = fun [ :tasks, :toggleTask ]:
  $ul 'ls:none p:0'
    {tasks.map(fun task:
      $li 'c:pointer mt:mb:5px'
        key:{task.id}
        onClick:{fun: toggleTask(task.id)}
        'td:{task.completed ? `line-through` : `none`}'
        {task.text}
    )}






$App = fun:
  tasks = []
  filter = `all`

  addTask = fun task:
    if task:
      newTask = [ id: Date.now(), text: task, completed: false ]
      tasks += newTask

  toggleTask = fun id:
    tasks = tasks.map(fun task:
      task.id === id ? [ ..task, completed: !task.completed ] : task
    )

  filteredTasks = tasks.filter(fun task:
    if filter == `completed` return task.completed
    if filter == `active` return !task.completed
    return true
  )

  $div 'ta:center maxw:600px m:auto'
    $h1 `Todo List`
    $TaskInput
      addTask:{fun text:
        tasks += [id: Date.now(), :text, completed: false]
      }
    $TaskList tasks:{tasks.filter(fun t: !t.isCompleted)}
    $div
      $button onClick:{fun: setFilter(`all`)} `All`
      $button onClick:{fun: setFilter(`active`)} `Active`
      $button onClick:{fun: setFilter(`completed`)} `Completed`


$TaskInput = fun [ :addTask ]:
  input = ``

  handleSubmit = fun e:
    e.preventDefault()
    addTask(input)
    input = ``

  $form onSubmit:{handleSubmit}
    $input
      type:`text`
      value:{input}
      onChange:{fun e: setInput(e.target.value)}
      palceholder:`Add a new task`
    $button type:`submit` `Add`


$TaskList = fun [ :tasks, :toggleTask ]:
  $ul 'ls:none p:0'
    {tasks.map(fun task:
      $li 'c:pointer mt:mb:5px'
        key:{task.id}
        onClick:{fun: toggleTask(task.id)}
        'td:{task.completed ? `line-through` : `none`}'
        {task.text}
    )}

```
