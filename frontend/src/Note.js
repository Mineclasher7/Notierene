import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend } from './backend';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { v4 } from 'uuid';
import './styles.css';

const Note = () => {
    const { UUID } = useParams();
    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [pages, setPages] = useState([]);
    const [title, setTitle] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${backend}/api/note/${UUID}`);
                setPage(response.data.page);
                setBlocks(response.data.blocks);
                setPages(response.data.pages);
                setTitle(response.data.title);
                console.log(page)
                const data = {
                    page: response.data.page,
                    blocks: response.data.blocks,
                    pages: response.data.pages,
                    title: response.data.title
                };
                //localStorage.setItem('myData', JSON.stringify(data));
                //const storedData = JSON.parse(localStorage.getItem('myData'));
                //console.log(storedData)
            } catch (error) {
                console.log('Error encountered:', error); // Log any error encountered
            }
        };
        fetchData()
    }, [UUID]);
    
    const createPage = async (event) => {
        try {
            //create page without server?
            const response = await axios.post(`${backend}/createPage`, {});
            //Need to sync
            const page_uid = response.data.page_uid;
            const title = "Untitled";
            const newPage = { page_uid: page_uid, title: title};
            setPages(prevPages => [...prevPages, newPage]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deletePage = async (page_uid) => {
        try {
            console.log("Page DELETE:", page_uid);
            const response = await axios.post(`${backend}/deletePage`, {
                page_uid: page_uid
            });
            setPages(prevPages => prevPages.filter(page => page.page_uid !== page_uid));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const syncPull = async () => {
        try {
            const response = await axios.get(`${backend}/api/note/${UUID}`);
            const data = {
                page: response.data.page,
                blocks: response.data.blocks,
                pages: response.data.pages,
                title: response.data.title
            };
            localStorage.setItem('myData', JSON.stringify(data));
            const storedData = JSON.parse(localStorage.getItem('myData'));
            console.log(storedData)
        } catch (error) {
            console.log('Error encountered:', error); // Log any error encountered
        }
    };

    const syncPush = async () => {
        try {
            const response = await axios.get(`${backend}/api/note/${UUID}`);
            const data = {
                page: response.data.page,
                blocks: response.data.blocks,
                pages: response.data.pages,
                title: response.data.title
            };
            localStorage.setItem('myData', JSON.stringify(data));
            const storedData = JSON.parse(localStorage.getItem('myData'));
            console.log(storedData)
       
        } catch (error) {
            console.log('Error encountered:', error); // Log any error encountered
        }
    };

    //JUST FUCKING KIDDING I HAVE NO IDEA HOW TO MAKE EMBEDDED LINKS WORK
    //BUT THAT IS NOT THE PROBLEM THE PROBLEM IS THAT MAKING AN ENTIRE APP WITH 1 PERSON IS SLOW AS SHIT AND NEEDS INFRASTRUCTURE
    //SO THIS WILL COME TO A PAUSE

    const makeLink = (pageTitle) => {
        console.log(pageTitle)
        return axios.post(`${backend}/api/note/${UUID}/requestLink`, {
            title: pageTitle
        })
        .then((response) => {
            const page = response.data.page;
            console.log(response.data)
            if (page) {
                // If the page exists, return a link to it
                return `<a href="/note/${page.page_uid}">${page.title}</a>`;
            } else {
                console.log("NO PAGE")
                // If the page doesn't exist, return just the title
                return pageTitle;
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            throw error;
        });
    }
    
    // Function to parse input text and create links
    const createLink = (text) => {
        const linkRegex = /\[\[([^\]]+)\]\]/g;
        let parsedText = text;
        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            const pageTitle = match[1];
            const linkPromise = makeLink(pageTitle); // Get the promise
            parsedText = parsedText.replace(match[0], linkPromise); // Replace with the promise
        }
    
        return parsedText;
    }


    const createBlock = (event, blocks, index) => {
            try {
                
                //create block without server 
                let pre = event.target.textContent.substring(
                    0,
                    getCaretPosition(event.target)
                );
                let post = event.target.textContent.substring(
                    getCaretPosition(event.target)
                );
                //const storedData = JSON.parse(localStorage.getItem('myData'));
                //storedData.blocks[index].content = pre
                //storedData.blocks[index + 1].push = post
                axios
                    .post(`${backend}/api/note/${UUID}/createBlock`, {
                        parent_uid: event.target.getAttribute('data-id'),
                        pre: pre,
                        post: post,
                    })
                    .then((response) => {
                        event.target.innerHTML = pre;

                        // Create a new div element
                        const newElement = document.createElement('div');
                        newElement.setAttribute('data-id', response.data.new_uid);
                        newElement.setAttribute('class', 'note');
                        newElement.setAttribute('contentEditable', 'true');
                        newElement.textContent = post || '';

                        // Add event listeners to the new element
                        newElement.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                createBlock(event, blocks, index);
                            } else if (event.key === 'Backspace') {
                                handleBackspace(event, blocks, index);
                            } else if (event.key === 'ArrowDown') {
                                handleDown(event, blocks, index);
                            } else if (event.key === 'ArrowUp') {
                                handleUp(event, blocks, index);
                            }
                        });
                        newElement.addEventListener('input', saveData);
                        //newElement.addEventListener('click', handleClick);
                        event.target.insertAdjacentElement('afterend', newElement);

                        // Set newElement as the active element
                        newElement.focus();
                        blocks[index].content = pre

                        //fix code to change index

                        blocks.splice(index+1, 0, { "block_uid": response.data.new_uid, "content": { "type": 'text', "content": post || '' } });
                        //setBlocks(blocks)
                        console.log(blocks)
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            } catch (error) {
                console.error('Error:', error);
            }
        };

    const deleteBlock = async (event, blocks, index) => {
        try {
            
            // Delete block without server
            const post = event.target.textContent; // Extract text content instead of HTML content
            const response = await axios.post(`${backend}/api/note/${UUID}/deleteBlock`, {
                parent_uid: event.target.getAttribute('data-id'),
                post,
            });

            const uid = response.data.new_uid;
            const focusedElement = document.querySelector(`[data-id="${uid}"]`);
            const postNode = document.createTextNode(post);
            focusedElement.appendChild(postNode);

            const range = document.createRange();
            range.setStart(focusedElement.lastChild, 0);
            range.collapse(true);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            focusedElement.focus();

            event.target.remove();

            //change index now

            //change blocks array
            blocks.splice(index, 1);
            //setBlocks(blocks)
            console.log(blocks)
        } catch (error) {
            console.error('Error:', error);
        }
    };



    //make offline data and sync
    //store data in offline files
    const saveData = (event) => {
        try {
            //save data without server
            axios
                .post(`${backend}/api/note/${UUID}/saveData`, {
                    block_uid: event.target.getAttribute('data-id'),
                    content: event.target.textContent
                })
                .then((response) => {
                    
                })
                .catch((error) => {
                    console.error('Error:', error);
             
                });
        } catch (error) {
            console.error('Error:', error);
        }
    };
    /*
    const handleClick = (e) => {
        const dataId = e.target.getAttribute('data-id');
        const text = e.target.innerHTML;
        const cursorPosition = getCursorPosition(e.target);

        const charactersBeforeCursor = text.substring(0, cursorPosition);
        const charactersAfterCursor = text.substring(cursorPosition);

        console.log('Data ID:', dataId);
        console.log('Characters Before Cursor:', charactersBeforeCursor);
        console.log('Characters After Cursor:', charactersAfterCursor);
    };
    */

    const handleBackspace = (event, blocks, index) => {
        const cursorPosition = getCaretPosition(event.target);
        const textBeforeCursor = event.target.innerHTML.substring(0, cursorPosition);
        if (textBeforeCursor.length === 0) {
            deleteBlock(event, blocks, index);
        }
    };
    const handleDown = (event, blocks, index) => {
        //since index not working get index by block id and focus next block
        
        const currentBlock = event.target;
        console.log(event.target)
        const currentLine = getCurrentLine(currentBlock) 
        const lastLine = getLastLine(currentBlock)
        
        if (lastLine === currentLine) {
            const nextBlock = blocks[index + 1];
            if (nextBlock) {
                console.log(nextBlock.block_uid)
                const nextBlockElement = document.querySelector(`div[data-id="${nextBlock.block_uid}"]`);
                nextBlockElement.focus();
                event.preventDefault();
            }
        }
    }

    const handleUp = (event, blocks, index) => {
        //since index not working get index by block id and focus next block
        const currentBlock = event.target;
        const currentLine = getCurrentLine(currentBlock)
        
        if (currentLine === 1) {
            const lastBlock = blocks[index - 1];
            if (lastBlock) {
                console.log(blocks[index-1])
                const nextBlockElement = document.querySelector(`div[data-id="${lastBlock.block_uid}"]`);
                nextBlockElement.focus();
                event.preventDefault();
            }
        }
    }

    //const getCurrentBlock = (event, blocks)
    
    function getCurrentLine(element) {
        // Check if the text content is empty
        if (!element.textContent.trim()) {
            // If the text content is empty, return line number 0 or 1, depending on your preference
            return 1; // or return 0
        }
    
        const containerOffset = element.getBoundingClientRect().top;
        const caretOffset = getCaretOffsetY(element) - containerOffset;
        console.log("Adjusted Caret Offset Y:", caretOffset);
    
        // Get the line height
        const computedStyle = window.getComputedStyle(element);
        const lineHeight = parseInt(computedStyle.lineHeight);
    
        // Calculate the line number based on the adjusted caret offset and line height
        const lineNumber = Math.ceil(caretOffset / lineHeight);
        console.log("LINE NUM:" + lineNumber)
        return lineNumber;
    }
    
    
    function getCaretOffsetY(element) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        console.log("RECT: "+ rect)
        return rect.top;
    }
    

    function getCaretPosition(element) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return 0;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return preCaretRange.toString().length;
    }

    function getLastLine(element) {
        // Get the height of the container element
        const containerHeight = element.offsetHeight;
    
        // Find proper last line
        const computedStyle = window.getComputedStyle(element);
        const lineHeight = parseInt(computedStyle.lineHeight);
        const lastLineNumber = containerHeight / lineHeight;
        console.log(lastLineNumber)
        return lastLineNumber;
    }

    //add delete button
        return (
            <div className="notieren-app flex">
              {page && (
                <div className="sidebar w-1/4 p-4 bg-gray-700">
                  <div onClick={togglePopup} className="mb-4 text-white">
                    {title}
                  </div>
                  <div onClick={createPage} className="mb-4 text-white cursor-pointer">
                    ADD Page
                  </div>
                  {pages.map((page, index) => (
                    <div key={index} data-id={page.page_uid} className="mb-2">
                      <Link href={`/note/${page.page_uid}`}>
                        <a className="text-white hover:underline">
                          {page.title !== '' ? page.title : "Untitled"}
                        </a>
                      </Link>
                      <div onClick={() => deletePage(page.page_uid)} className="ml-2 text-red-500 cursor-pointer">X</div>
                    </div>
                  ))}
                </div>
              )}
              {page && (
                <div className="frame w-3/4 p-4">
                  <div
                    style={{
                      maxWidth: '100%',
                      minWidth: '0px',
                      width: '900px',
                      margin: 'auto',
                    }}
                  >
                    <div
                      className="title text-black text-4xl mb-4"
                      data-id={page.page_uid}
                      contentEditable="true"
                      onInput={saveData}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                        }
                      }}
                    >
                      {page.title}
                    </div>
                  </div>
        
                  <div className="page-content max-w-3xl w-full">
                    {blocks.map((block, index) => (
                      <div
                        key={index}
                        data-id={block.block_uid}
                        className="note mb-4 p-4 bg-gray-100 rounded-md"
                        contentEditable="true"
                        onInput={saveData}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            createBlock(event, blocks, index);
                          } else if (event.key === 'Backspace') {
                            handleBackspace(event, blocks, index);
                          } else if (event.key === 'ArrowDown') {
                            handleDown(event, blocks, index);
                          } else if (event.key === 'ArrowUp') {
                            handleUp(event, blocks, index);
                          }
                        }}
                      >
                        {createLink(block.content.content)} {/* Parse and create links */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        };

export default Note;