import * as prelude from './prelude.mjs';

/** @type {import('./pinboard.mjs')} */
const pinboard = await import(prelude.dynamicPath('./pinboard.mjs'));
/** @type {import('./test.mjs')} */
const test = await import(prelude.dynamicPath('./test.mjs'));

export const PINBOARD_XML = `<?xml version="1.0" encoding="UTF-8"?>
<posts user="asmithee">
<post href="http://c-faq.com/decl/spiral.anderson.html" time="2022-05-21T06:26:01Z" description="Clockwise/Spiral Rule" extended="" tag="c c++" hash="970c1c894ea099f677fbfa18e74e5e31"  shared="no" toread="yes" />
<post href="https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html#gs.x8oazh" time="2022-04-13T13:12:10Z" description="Fix Performance Bottlenecks with Intel® VTune™ Profiler" extended="" tag="performance profiling tools" hash="2ab1611711c8bb5ed9273b8f4b612fca"  shared="yes"  />
<post href="https://docs.microsoft.com/en-us/sysinternals/downloads/procmon" time="2020-11-24T02:24:59Z" description="Process Monitor - Windows Sysinternals | Microsoft Docs" extended="Monitor file system, Registry, process, thread and DLL activity in real-time." tag="windows-dev" hash="b87fcc08e549f4076ebeeeaf095482a5"  shared="no"  />
</posts>
`;

const parseXmlTest = test.makeTest('parseXml should parse posts', () => {
  const parser = new DOMParser();
  const posts = pinboard.parseXml(parser, PINBOARD_XML);
  console.log(posts);
  test.assert(posts.length === 3);
});

export const PINBOARD_HTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Pinboard Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p><DT><A HREF="http://c-faq.com/decl/spiral.anderson.html" ADD_DATE="1653114361" PRIVATE="0" TOREAD="0" TAGS="c,c++">Clockwise/Spiral Rule</A>

<DT><A HREF="https://docs.microsoft.com/en-us/sysinternals/downloads/procmon" ADD_DATE="1606184699" PRIVATE="1" TOREAD="0" TAGS="windows-dev">Process Monitor - Windows Sysinternals | Microsoft Docs</A>
<DD>Monitor file system, Registry, process, thread and DLL activity in real-time.

<DT><A HREF="https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html" ADD_DATE="1649855530" PRIVATE="1" TOREAD="1" TAGS="performance,profiling,tools,toread">Fix Performance Bottlenecks with Intel® VTune™ Profiler</A>
</DL></p>
`;

const parseHtmlTest = test.makeTest('parseHtml should parse posts', () => {
  const parser = new DOMParser();
  const posts = pinboard.parseHtml(parser, PINBOARD_HTML);
  console.log(posts);
  test.assert(posts.length === 3);
});

export const tests = [parseXmlTest, parseHtmlTest];
