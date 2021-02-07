---
title: "My personal bug fixing workflow"
aliases:
  - /my-personal-bugfixing-workflow
preview: "I'm sharing my typical workflow when it comes to bug fixing. We're going from the reading of the bug report to the final commit of the fix."
date: 2016-06-01T09:00:00+01:00
meta_description: "My personal workflow when dealing with bugs"
categories: "Bugs"
layout: "post"
changefreq: "yearly"
lastmod: 2021-01-01T09:00:00+01:00
priority: 0.7
---

I am a conservative person.

Recently, I've started thinking this is a great quality, especially for a developer.

Of course, I like improvements; the kind of changes I am more prone to make, are those which affect code readability, or bring coherence to the codebase; who have worked with me can confirm how pedantic I am on these kind of things.

I change my own code (and blog posts) several times before I push on the repository. But I like to have control on this stuff: I need to know I've the time to evaluate the outcome of the changes I'm making; I need to know I am protected by solid unit tests (and other tools), which will prevent me to modify the code in any harmful way. I don't like to have to change code under my responsibility, just to fix a bug *asap*... in my experience this is the safest way to introduce fresh new tech debt, or more often two new bugs for the next iteration.

In this post I'm going to share my personal approach to bug fixing.

Reading the article, you probably recognize yourself in some, or even many, of these practices; there's nothing of extraordinarily complex in each of them; these are just little tips, which may even be insignificant individually, but which, I found, together have a huge impact on the outcome of my work.

## Background

I am Bruno Scopelliti. I am a senior developer at [YNAP](http://www.ynap.com/).

When I joined the group, three years ago, I started working in a team particularly focused on the improvement of existing features, and more often bug fixes. I have had other experience before, but no one of these was in a such big context. I worked in that team for almost one year, and now I'm working on the platform that serves most of YNAP's online stores.

I am kinda of a full stack developer (.NET, Node.js), but I spend more time programming with JavaScript, in a browser. Reading the article, you'll find that even if some of the concepts are strictly tied to front-end development, most of them aren't specific to a particular technology.

So, what I'm going to share here is fruit of lessons I've learned the hard way in the last couple of years.

## Attitude

Let's start from the real beginning.

Observing many people working around me, I've got the impression that some of them when get a bug assigned, strive to fix the problem as soon as possible, more than to understand what has caused the problem.

Sadly, the fastest way to smash a bug, is also rarely the better way; and almost always, it involves bringing changes to existing code.

I've a different attitude - *remember, I am a conservative person* - and when I've to fix a bug, changing the code is the last thing I want to do.

To make things easy, I try to convince myself that there's no bug at all; even when the bug report comes with a stack trace, this still does not prove that the issue is caused by code under my responsability (observation of the outcome of past bugs helps a lot here).

I understand this may seems pretty arrogant quite like "*Hey, my code can't have bugs*", but I believe this mindset helps prevent that potentially more harmful changes are merged into the codebase.

Even if I've this attitude through the bug, I've all the interest in conducting an impartial analysis of the issue.

I can now recognize a pattern, I almost always follow when I analyze a bug.

## Reading carefully the bug report

Well, reading the bug report is something everyone on this earth surely does.

When I read the notes attached to a bug, I try to map the error to an area of the codebase, e.g. if the bug prevents new user to register to my newsletter, I immediately start to think about the software components involved in this feature.

When you're new to a codebase, this won't be easy to accomplish effectively, but probably you shouldn't have been left alone to fix a bug in a new codebase.

Pair programming is definitely a great way to introduce new developers to your codebase, however *mentorship* is what works better for me. Having a mentor assure you the freedom to explore the new codebase, but prevents situations in which you could be stuck, without any ideas about how to approach the problem. Sorry, I've deviated from the bug report.

Well, if you've a solid knowledge of the codebase, the time you spend reading, and thinking about the issue is definitely well spent.

If I recognize the issue affects a pretty crap area of the codebase, my attitude through the bug changes a little; or I consolidate my attitude if I know the problem is on an area on which nobody has worked for the last two years.

If your team has a QA, when you get assigned the bugs, they may also provide you additional details, which usually are not added to the bug report; such as *this is the third bug this week on the newsletter*, or *last week Junior has added a new field to the newsletter form*.

In this phase, I don't care too much about other conditions such as browser, OS... and later you'll understand why.

At the end with all the info I collected I've a better understanding of the problem I've to solve.

## Epiphany

While reading carefully the report, I have sometimes an epiphany of the bug 😄

I can remember the implementation of the feature, and immediately understand what is causing the problem. In truth, these situations are rare, and occur mostly on features which I personally developed, or that I know very well.

In these cases the temptation to just fix the bug and move on is strong, however I keep following my usual workflow.

## Replicate the bug

When I've enough information about the problem, I always want to see the bug happen with my eyes.

Even when the bug report states the bug afflicts a very specific version of Internet Explorer, I always try to replicate the bug in Chrome first...
that's partially because Chrome has the best debugging tools, and partially because I often work with jQuery, that takes care for me of all the cross browser inconsistencies.

I never use Canary (or other browser dev release) for my job, and you shouldn't too. I like the new features, and I like to explore them in advance, but, hell, I can wait a couple of months before using them for my job, and in the meanwhile keep working without the hassles which an unstable platform might cause.

In order to remove noise coming from previous sessions, addons, etc. I always switch to *Incognito* to replicate the bug; and when I've to replicate the bug on a particular browser, that does not support incognito mode, I force my own private navigation by cleaning cache, cookies, everything.

(Sadly) the number of fake bugs which I smashed by simply following this procedure is insanely high.

Only when it's not possible to replicate the issue with Chrome, I try using the browser specified in the bug report.

Sometimes, no matter how hard I try, I'm not able to replicate the bug; in this case when possible I get up from my chair, to talk directly with the person who has opened the bug first. I always prefer real time communication channel (such as skype, slack, etc.) over email, cause prevents distractions. Usually we try together to reproduce the bug, and in the overall I get more insights on the issue; at the end, we find out how to reproduce the bug, or when the bug effectively is not anymore reproducible, we mark it as closed.

In case the sequence to reproduce the bug is particularly complex, I am not ashamed by writing it down... then I've just to follow a bullet list, and focus my attention on the real problem I want to solve.

## Randomic bugs

Every programmer sooner, or later faces the dreadful situation of a randomic bug; even when you scrupulously follow the same steps every time, the bug only sometimes shows up.

One thing I learned in these years: randomic bugs do not exist; there're only bugs you just haven't found out how to reproduce yet.

A bug can't be truly randomic, unless you're randomly trowing exceptions, using your language built-in random values generator... and even in this case, if you know the seed, you can still reproduce the issue.

A bug could be hard to reproduce until you've understood what is causing it; but when the cause is clear, reproduce whatever bug is a breeze.

There're a few methods, which, I found out, work pretty well in order to understand how to reproduce a bug, that appears to be randomic.

Logs are terrific. I grab a log of a healthy sequence, and a log of bugged sequence; then I compare the logs, and BOOM (if I don't suck at logging) I've a great hint about what is causing the problem.

Sometimes you might find there's a race condition between two network requests... then using a tool such as fiddler ([Fiddler](http://www.telerik.com/fiddler "Fiddler, The free web debugging proxy") is really great) you could force a delay on a specific request, and make the bug always reproducible from your machine. Sometimes you might find there's correlation between the bug and the fail of a specific resource... then always with fiddler, or directly from Chrome, you could force the loading of that specific resource to fail; and again the bug comes to be always reproducible.

At the end of the day, I always work with bugs which are always reproducible; and deal with such bugs is not that difficult; even when the problem is complex, having understood its causes, and being able to replicate it at my own pleasure, give me the feeling I dominate the problem, and find out the best solution is just a matter of time.

When logs fails... well disposed logs rarely fail to help. So before going further it's probably a good idea to check if logs can be improved. Otherwise, the only remaining option for me is to randomly try to understand the causes of the randomic bug. The following are a couple of things which have worked for me in the past:

* Going backward in the time of a couple of weeks. If the bug wasn't there, I ask myself, what is changed in the meanwhile.

* Set breakpoints, or counters (when I can't break the flow of the program) here and there (I let my intuition guide me). This is helpful cause I might discover healthy sequence, and bugged sequence follow different code path.

* Force a specific code path; there's always a suspect `if` statement somewhere... when I found it, I try to set its value to a constant (always true/false), then I check if this changes somehow the probability to replicate the bug.

Until today, it's never happened that no one of these methods have worked.

## Debugging

Unless that, in order to replicate the bug, I've had to do a deep analysis of the problem, such as the one I described in the previous paragraph, at this point I usually have not a clue about what might being the cause of the issue. So it's time to start debugging to understand what is causing the problem.

The obvious question at this point it's where should I attach breakpoints first?

In case the bug report contained also a stack trace of the error, or when I can spot an error in the browser console (server logs applies as well), I usually parse it, looking for some familiar names... and it's not usually hard to spot at least one; so I start by attaching a breakpoint to that function.

The worst bugs are those which happen silently; no errors in console, no stack trace, apparently everything is ok, but still the application is not acting the way expected. In this case I follow different strategies on the basis of the kind of issue I'm facing. Perhaps the issue involves DOM interactions? Great, then I attach DOM breakpoints to the elements involved, so that every time something happen to them, the execution breaks in debugging mode. Perhaps there's an ajax request to a particular action? Good, I'll start from that action, or from its filters, in case I can't reach the action.

After having disposed some breakpoints, I'm ready to replicate the bug once again, but this time I'm going to follow scrupulously the execution flow... and generally this is all I need to understand what is causing the problem, and form in my mind a general idea of how to fix it.

However before fixing the issue, I always ask myself how it's possible that this bug wasn't discovered before. Even if sometimes asking this question does not make great sense, cause the bug might be on a new feature, or might be an edge case, I think it's very important in order to understand the real causes of the issue, and prevent it from returning in the future.

If I am a library/framework provider, to answer this question, I take the time to understand how different people are using my code. Are they using the library, following the specifics, or have they somehow hacked it, to make it fit their specific need? Are different people using the library differently? Were they all forced to implement the same hack? Does the way people are using the library affect the reproducibility of the issue? These are all questions I try to answer, before effectively deciding if the issue is something that should be fixed by changing the code.

However sometimes this is not enough; in this case I check the history of the files involved, and often find that they've been recently modified. This not only answer my initial question, but it's also a great hint about what probably have caused the bug.

## The fix

So at the end I was wrong. The bug was a real bug, and I've to change the codebase; at least now I'm sure it's for the good.

I'm everything, but definitely not a TDD fan. Don't get me wrong, I understand how important unit tests are, just haven't seen great benefits in writing them first all the time. However, one case in which I almost always prefer TDD approach is bug fixing.

I think that TDD approach is great for bug fixing, cause writing a function that always bring out the issue, gives me a simplified environment in which I can more easily replicate, and fix the bug; then, when the bug is fixed, that test will also assure me that the issue won't come back.

When I've the test(s), everything I've to do is to make them turn green, and (after a last check in the browser) voilà, the bug is gone.

This is also a great moment to ask myself why the pre existent unit tests haven't protected the codebase against this new bug: low coverage? poor implementation? When it's possible I try to apply the [boyscout rule](http://programmer.97things.oreilly.com/wiki/index.php/The_Boy_Scout_Rule "Boy Scout rule applied to software development").

## Releasing the bugfix

When the bug is fixed, it's yet time to release it.

First thing to think about is how to update the version of the files I've changed. I usually respect [SemVer](http://semver.org/ "Semantic Versioning") scheme; however it's pretty rare I'm forced to break backward compatibility to fix a bug... so usually I just update the patch digit of the version number, then commit the changeset.

I always strive to concentrate all the works I've done in a single commit, because I think that, in the future having all changes displayed together could be useful. With this in mind, also the commit message is particularly important. In my opinion commit messages should be pretty short. The only thing that cannot miss is a reference to the bug; and usually the bug id is enough... so that someday in the future me, or my coworkers, reading the history, and watching the changeset, could have a better understanding of the rationale beyond a specific change.

When it's not possible to complete all the work in a single commit, the best alternative is to open a new branch.

## Conclusion

That's it, with the final push of the changeset the bug is fixed, and my personal bugfix workflow is completed.

Probably I could spend less time to fix a bug; however taking the right time to understand the context in which the issue is happening gives me, and my team, additional benefits, such as progressive deeper understanding of the codebase, and reduction of regressions.

Chances are that me and you are doing something differently and this is perfectly fine... this wasn't meant to be a lesson, or a tutorial of any kind... just some notes about my usual workflow, in order to have some sort of feedback. So, What are you doing differently? Have you found better strategies to replicate randomic bugs? Do you have some secret weapon, you use only against the hard bugs? Please share your opinion with a comment.
