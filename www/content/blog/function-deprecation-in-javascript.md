---
title: "Function deprecation in JavaScript"
preview: "A little known ESLint plugin helps deal with aging codebase."
date: 2021-05-01T20:52:17+01:00
meta_description: "Deprecate function in JavaScript, eslint-plugin-deprecate"
categories: ["Tools", "ESLint"]
layout: "post"
changefreq: "yearly"
lastmod: 2021-05-01T20:52:17+01:00
priority: 0.7
---

When a codebase grows, and gets old is inevitable that functions, or whole areas become obsolete,
and their usage is discouraged in favour of better alternatives.

If the codebase is big enough, it might be not possible, or not easy to replace the usages
of legacy components with their alternative in a single step ... in such cases it's important
to have a way to signal a particular component is *deprecated*, and shouldn't be used anymore,
so that at least it doesn't spread further.

To deal with such situations, I've found helpful the [deprecate](https://www.npmjs.com/package/eslint-plugin-deprecate) ESLint plugin.

It permits to emit a warning, or error - I prefer the first in such case - when it finds a
reference for a certain component marked as deprecated.
<br/>
Below an example of configuration:

```json
{
    "plugins": [
        "deprecate"
    ],
    "rules": {
        "deprecate/function": [
            "warn",
            {
                "name": "doSomething",
                "use": "Use doSomethingBetter instead"
            }
        ],
        "deprecate/import": [
            "warn",
            {
                "name": "leftpad",
                "use": "Use built-in padStart instead"
            }
        ]
    }
}
```

There is also the option to deprecate object members - through the `deprecate/member-expression`
rule - but I didn't find any use case for it so far.