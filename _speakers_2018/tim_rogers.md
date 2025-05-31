---
layout: archive_speaker
name: Tim Rogers
bio: "Software Engineer, GoCardless"
details: "Tim is a Software Engineer at GoCardless, a fintech startup based in London building a global bank-to-bank payments network for the internet. Since joining GoCardless 6 years ago, Tim has worked across the business in a variety of roles, from running the customer support operation in the company's first few years to helping the sales team build effective practices and processes. He loves spending his day building powerful and well-documented APIs to maximize developer happiness."
image: "/images/2018/speakers/tim_rogers.jpg"
talk_title: ""
talk_description: ""
twitter: https://twitter.com/timrogers
website: "https://timrogers.co.uk/"
linkedin: ""
is_keynote: false
gender: male
permalink: /2018/speakers/tim-rogers/
sessions:
    -   day: 2
        time: "10:00 AM - 10:45 AM"
        title: "Miles More Maintainable: Building APIs with the Middleware Pattern."
        talk_description: "When you’re building an API, things start simple. But before you know it, there’s logic
to reuse, from authentication to validation. This usually means a confusing list of
before_actions. But there is a solution: moving from convoluted controllers to robust,
maintainable chains of middleware.
When you’re building an API, things start off simple. But before you know it, there’s
lots of logic you want to build abstractions around and reuse - for example
authentication, input validation and pagination.
This usually means having a long list of callbacks living in your ApplicationController
using Action Controller’s before_action magic. This leads to:
tangled data dependencies (where callbacks depend on data retrieved by other
callbacks and stored in instance variables - the authenticated user, for example)
hidden behavior (all those excepts and only on your before_actions are hard to
reason about and separated from your code, usually living in ApplicationController!)
difficulties with testing (unit testing methods inside a controller is hard!)
The middleware pattern can help us to bring sanity to our APIs and make them miles
more maintainable
This pattern, used by Elixir’s Phoenix, Node’s Express and even Ruby’s Rack helps us
to untangle our data dependencies, make our code much more explicit and easily
unit test complex behavior. We can apply this pattern to our Rails application to
move faster and write more maintainable code.
In this talk, you’ll learn how to move from convoluted controllers to robust,
maintainable and well-tested chains of middleware built using an open-source gem,
Coach (https://github.com/gocardless/coach).
Each middleware can do exactly one job - for example, authenticating a user or
validating input - and then either send a response to the client (for example an
“invalid access token”) error or it can pass data along (for example the authenticated
user) and call the next middleware.
This talk is based on a blog post I wrote, “When good controllers go bad: getting
started with Coach” (https://gocardless.com/blog/getting-started-with-coach/)."
---
