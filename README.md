# contributors-svg

Service to show contributor faces in your project README with SVG.

Copyright (c) 2021 by Gadi Cohen <dragon@wastelands.net>.  MIT Licensed.

## Quick Start

Just add the following to your README (replacing USER and REPO):

```md
![contributor-faces](https://contributors-svg.vercel.app/api/svg?user=USER&repo=REPO)
```

It looks like this (for `node-yahoo-finance2`):

![contributor-faces](https://contributors-svg.vercel.app/api/svg?user=gadicc&repo=node-yahoo-finance2)

Thanks to [Vercel](http://vercel.com/) for the free hosting.  Let's hope this
doesn't get popular enough to exceed my free limits :)

## Features

* SVG with individual links and titles for each circle-clipped face
* Images are Data URL encoded so work fine with GitHub's CORS policy.

This is totally inspired by the
[Open Collective contributors.svg](https://remarkablemark.org/blog/2019/10/17/github-contributors-readme)
but for non-collective projects.  I didn't like other solutions that involved
creating the markup by hand or even by script / CI.

## TODO

* [ ] Do an Etag based on data used from Github contributor graph
* [ ] Max width, multi-row.

## Contributing

Run `vercel dev` for local development.

## See also

* https://contrib.rocks/ (contributor-img; static img with single a-href around it)
* https://remarkablemark.org/blog/2019/10/17/github-contributors-readme/
* https://github.com/ngryman/contributor-faces
* https://allcontributors.org/
