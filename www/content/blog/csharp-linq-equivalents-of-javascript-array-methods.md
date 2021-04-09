---
title: "C# LINQ equivalents of JavaScript array methods"
aliases:
  - /csharp-linq-equivalents-of-javascript-array-methods
preview: "Yep, your suspects are right... Yet another \"equivalent of JavaScript [feature] in C#\" post for the polyglot programmers out there."
date: 2017-04-25T09:00:00+01:00
meta_description: "Equivalent in C# of JavaScript array methods"
categories: "C#"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

At work, in the last couple of years I've always more, and more written C# code.
It's nice, and it has lots of similarities with JavaScript.

Despite this, I am not such productive with C#, as I am with JavaScript, and I often find myself
asking colleagues, or searching the Internet for *equivalent of JavaScript [feature] in C#*...
I rarely get disappointed.

In this post we explore the equivalent in C# of some of the most useful JavaScript array methods.

## Language INtegrated Query

JavaScript has prototypal inheritance, hence *prototypes*, and all the arrays have 
access to the methods defined on the Array's prototype. 
<br/>
That's why `typeof [].forEach == "function"`.

So what about C#?
<br/>
Since .NET Framework 3.5, LINQ (Language Integrated Query) permits to work very conveniently
with data collections, and more specifically with all the types which implement the `IEnumerable`
or `IEnumerable<T>` interface. These types are often referred as *queryable* type.

**Anyway, there's an important difference**. Despite most of the methods defined on the
Array prototype have a counterpart in the LINQ library, there's an important difference.
<br/>
LINQ methods don't return a collection (as in JavaScript occur), but a query object,
that is a set of instructions about how to retrieve the data; the query itself is not executed
until the program effectively tries to access those data.
<br/>
The best part of this all is that the query objects still implement `IEnumerable<T>`,
so queries can be easily chanined (such as we're accustomed in JavaScript).

## Data

In the next sections we're going to work on a collection of orders.

```c#
List<Order> bill = new List<Order>() {
  new Order("wat", "Water", 2.0, 1),
  new Order("cok", "Coke", 2.5, 2),
  new Order("piz", "Pizza Margherita", 4.0, 2),
  new Order("piz", "Pizza Bufala", 7.5, 1),
  new Order("cof", "Coffee", 1.0, 2)
};
```

where the `Order` class is defined as:

```c#
using System;
using System.Collections.Generic;

public class Order {
  public Order(string code, string name, double price, int quantity) {
    this.Code = code;
    this.Name = name;
    this.Price = price;
    this.Quantity = quantity;
  }
  public string Code { get; set; }
  public string Name { get; set; }
  public double Price { get; set; }
  public int Quantity { get; set; }
}
```

If you want quickly try one of the following snippet, you can paste it on
[dotnetfiddle](https://dotnetfiddle.net/); it's like jsfiddle, but for .NET folks.

## Filter

[Enumerable.Where](https://msdn.microsoft.com/en-us/library/system.linq.enumerable.where.aspx)
creates a new collection, that contains the only elements of the original collection
which match the predicate.

```c#
var pizzas = order.Where(x => 
  x.Code.Equals("PIZ", StringComparison.InvariantCultureIgnoreCase));

foreach (string pizza in pizzas)
{
  Console.WriteLine(pizza.name);
}

// Pizza Margherita
// Pizza Bufala
```

## Map

[Enumerable.Select](https://msdn.microsoft.com/en-us/library/system.linq.enumerable.select.aspx)
creates a new collection, with the results of the execution of the provided function
on each element in the original collection.

```c#
var productNames = bill.Select(x => x.Name);

foreach (string productName in productNames)
{
  Console.WriteLine(productName);
}

// Water
// Coke
// ...
```

Here, C# folks are lucky enough who don't have to worry about *holes* in their list 😉

## Reduce

[Enumerable.Aggregate](https://msdn.microsoft.com/en-us/library/system.linq.enumerable.aggregate.aspx)
applies the provided function on each element in the original collection to generate a new value,
that may (or may not) be a collection.

```c#
double totalPrice = bill.Aggregate(0,
  (double price, Order order) => price + order.Quantity * order.Price);

Console.WriteLine(String.Format("Total Price: {0}€", totalPrice));

// Total Price: 24.5€
```

## Some

[Enumerable.Any](https://msdn.microsoft.com/en-us/library/system.linq.enumerable.any.aspx)
determines whether the collection contains at least one element that matches the predicate.

```c#
bool hasTax = bill.Any(x =>
  x.Code.Equals("TAX", StringComparison.InvariantCultureIgnoreCase));

// :~ false

// ... or in C# even without a preticate
bool isEmpty = ! bill.Any();

// :~ false
```

## Every

[Enumerable.All](https://msdn.microsoft.com/en-us/library/bb548541.aspx) determines
whether all the elements in the collection match the predicate.

```c#
bool isOnlyPizzaOrder = bill.All(x => 
  x.Code.Equals("PIZ", StringComparison.InvariantCultureIgnoreCase));

// :~ false
```
