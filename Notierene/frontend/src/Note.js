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

    const createBlock = (event, blocks, index) => {
        try {
            console.log(blocks)
            
            //create block without server 
            let pre = event.target.innerHTML.substring(
                0,
                getCaretPosition(event.target)
            );
            let post = event.target.innerHTML.substring(
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
                    newElement.innerHTML = post || '';

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
                    blocks.join()
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
            //delete block without server
            const post = event.target.innerHTML.substring(getCaretPosition(event.target));
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
                    content: event.target.innerHTML,
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

    const handleBackspace = (e) => {
        const cursorPosition = getCaretPosition(e.target);
        const textBeforeCursor = e.target.innerHTML.substring(0, cursorPosition);
        if (textBeforeCursor.length === 0) {
            deleteBlock(e);
        }
    };
    const handleDown = (event, blocks, index) => {
        console.log(index)
        const currentBlock = event.target;
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
        const currentBlock = event.target;
        const currentLine = getCurrentLine(currentBlock)

        if (currentLine === 1) {
            const nextBlock = blocks[index - 1];
            if (nextBlock) {
                const nextBlockElement = document.querySelector(`div[data-id="${nextBlock.block_uid}"]`);
                nextBlockElement.focus();
                event.preventDefault();
            }
        }
    }

    //const getCurrentBlock = (event, blocks)
    
    function getCurrentLine(element) {
        const caretPosition = getCaretPosition(element);

        // Get line height
        const computedStyle = window.getComputedStyle(element);
        const lineHeight = parseInt(computedStyle.lineHeight);

        // Calculate the line number based on the caret position and line height
        const lineNumber = Math.floor(caretPosition / lineHeight) + 1;

        return lineNumber;
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
        const selection = window.getSelection();
        if (!selection.rangeCount) return -1;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        const lines = preCaretRange.toString().split('\n');
        const lastLineNumber = lines.length;
        return lastLineNumber;
    }

    //add delete button
    return (
        <div className="notieren-app">
            {page && (
                <div className="sidebar">
                    <div onClick={togglePopup}>{title}</div>
                    <div onClick={createPage}>ADD Page</div>
                    {pages.map((page, index) => (
                        <div
                            key={index}
                            data-id={page.page_uid}
                            className="sidebar-link"
                        >
                            <Link to={`/note/${page.page_uid}`} className="page-link">
                                {page.title !== '' ? page.title : "Untitled"}
                            </Link>
                            <div onClick={() => deletePage(page.page_uid)} className="page-delete">X</div>
                        </div>
                    ))}
                </div>
            )}
            {page && (
                <div className="frame">
                    <div
                        style={{
                            maxWidth: '100%',
                            minWidth: '0px',
                            width: '900px',
                            margin: 'auto',
                        }}
                    >
                        <div
                            className="title"
                            data-id={page.page_uid}
                            style={{
                                fontSize: '50px',
                                paddingLeft: 'calc(96px + env(safe-area-inset-left))',
                                paddingRight: 'calc(96px + env(safe-area-inset-right))',
                            }}
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

                    <div className="page-content">
                        {
                            blocks.map((block, index) => (
                            <div
                                key={index}
                                data-id={block.block_uid}
                                className="note"
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
                                //onClick={handleClick}
                               
                            >{block.content.content}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Note;