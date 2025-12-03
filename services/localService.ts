import TurndownService from 'turndown';

export const convertHtmlToMarkdown = (html: string): string => {
  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      hr: '---',
      bulletListMarker: '-',
    });

    // Custom rules can be added here if needed
    // For example, removing scripts or styles if Turndown doesn't handle them automatically
    turndownService.remove('script');
    turndownService.remove('style');
    turndownService.remove('noscript');

    return turndownService.turndown(html);
  } catch (error) {
    console.error("Local conversion failed:", error);
    return "Error converting HTML to Markdown. Please check the input HTML.";
  }
};