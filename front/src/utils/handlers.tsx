import { RefObject } from 'react';
import axios from 'axios';
import { backendURL } from '../../config'; // Import your backend URL from config
  
  export const handleDown = (
    event: any,
    blocks: any[],
    index: number,
  ) => {
    const currentBlock = event.currentTarget;
    const currentLine = getCurrentLine(currentBlock);
    const lastLine = getLastLine(currentBlock);
  
    if (lastLine === currentLine) {
      const nextBlock = blocks[index + 1];
      if (nextBlock) {
        const nextBlockElement = document.querySelector(`div[data-id="${nextBlock.block_uid}"]`) as HTMLDivElement;
        nextBlockElement?.focus();
        event.preventDefault();
      }
    }
  };
  
  export const handleUp = (
    event: any,
    blocks: any[],
    index: number,
  ) => {
    const currentBlock = event.currentTarget;
    const currentLine = getCurrentLine(currentBlock);
  
    if (currentLine === 1) {
      const lastBlock = blocks[index - 1];
      if (lastBlock) {
        const lastBlockElement = document.querySelector(`div[data-id="${lastBlock.block_uid}"]`) as HTMLDivElement;
        lastBlockElement?.focus();
        event.preventDefault();
      }
    }
  };
  
  //get currentline based on url within blocks array instead

  export function getCurrentLine(element: HTMLDivElement): number {
    if (!element.textContent?.trim()) {
      return 1; // or return 0
    }
  
    const containerOffset = element.getBoundingClientRect().top;
    const caretOffset = getCaretOffsetY(element) - containerOffset;
  
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseInt(computedStyle.lineHeight);
  
    const lineNumber = Math.ceil(caretOffset / lineHeight);
    return lineNumber;
  }
  
  export function getCaretOffsetY(element: HTMLDivElement): number {
    const selection = window.getSelection();
    if (!selection) return 0;
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    return rect.top;
  }
  
  export function getCaretPosition(element: HTMLDivElement): number {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return 0;
  
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
  
    return preCaretRange.toString().length;
  }
  
  export function getLastLine(element: HTMLDivElement): number {
    const containerHeight = element.offsetHeight;
  
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseInt(computedStyle.lineHeight);
    const lastLineNumber = containerHeight / lineHeight;
    return lastLineNumber;
  }
  