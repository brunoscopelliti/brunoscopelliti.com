---
title: "A C# Automapper trick"
aliases:
  - /a-csharp-automapper-trick/
preview: "This is just me trying to memorize something I've searched lots of time on Google."
date: 2017-06-05T09:00:00+01:00
meta_description: "Automapper map with extra parameter"
categories: "C#"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

Writing blog posts is infinitely valuable in helping me memorize new tricks; even when
it does not work, I can still more easily google for myself. Today's blog post is meant
to continue this glorious tradition.

In C# development it's pretty common to have to map fields between objects of different class.
[Automapper](http://automapper.org/) simplifies a lot the work.

For instance, in the simplest scenario given the two classes

```c#
public class ProductDto {
  public string name { get; set; }
  public string code { get; set; }
  public decimal price { get; set; }
  public string currency { get; set; }
}

public class Product {
  public string Name { get; set; }
  public string Code { get; set; }
  public decimal Price { get; set; }
  public string Currency { get; set; }
}
```

in order to copy values from `ProductDto` fields into a new `Product` instance,
we've to execute Automapper's `map` method

```c#
// ProductDto response.product
Product product = Mapper.Map<Product>(response.product);
```

and assure that the mapping has been configured sometime before:

```c#
Mapper.CreateMap<ProductDto, Product>()
  .ForMember(dest => dest.Code, x => x.MapFrom(src => src.code.ToUpper()));
```

Easy peasy. That has the nice bonus effect of working even with list of objects.

```c#
List<Product> products = Mapper.Map<List<Product>>(response.products);
```

Let's say now that one of `Product`'s field is not defined in the source object,
but it's known at run time in the context of the method that invokes the mapping.
An easy way to get out this situation is

```c#
List<Product> products = Mapper.Map<List<Product>>(response.products);

foreach(var product in products) {
  product.Foo = ...
}
```

... but I cannot do this without feel guilty; even more after I've found that
Automapper supports this use case almost as easily as the others.
<br/>
Let's start changing how we configure the mapping.

```c#
Mapper.CreateMap<ProductDto, Product>()
  .ForMember(dest => dest.Foo, x => x.ResolveUsing(res => res.Context.Options.Items["Foo"]));
```

then how we map at runtime

```c#
List<Product> products = Mapper.Map<List<ProductDto>, List<Product>>(response.products, opt => opt.Items["Foo"] = "Bar");
```

and now the mapping should work just fine.
