'use client'
import { useState, useEffect, RefObject } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation'
import { backendURL } from '../../../../config';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import '../../../../public/styles.css'
import {
  handleDown,
  handleUp,
  getCaretPosition,
} from '../../../utils/handlers';
import { useRouter } from 'next/navigation';
import { jwtInterceptor } from '@/utils/axiosConfig';

type page = {
    page_uid: string,
    title: string,
}


  

type block = {
    block_uid: any,
    content: any,
    page_uid: any,
}

const Note = () => {

    let UUID = useParams()?.UUID;
    const router = useRouter();
    

    const [page, setPage] = useState({
        page_uid: null,
        title: null,
        room_uid: null,
        block_order: null
    });
    const [blocks, setBlocks] = useState(Array<block>);
    const [pages, setPages] = useState<page[]>([]);    
    const [title, setTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                jwtInterceptor()
                console.log("UUID", UUID)
                
                const response = await axios.get(`${backendURL}/api/note/${UUID}`);
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
    
    
/*
    const syncPull = async () => {
        try {
            const response = await axios.get(`${backendURL}/api/note/${UUID}`);
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
            const response = await axios.get(`${backendURL}/api/note/${UUID}`);
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
*/

const makeLink = async (pageTitle: string): Promise<JSX.Element> => {
    console.log(pageTitle);
    try {
      const response = await axios.post(`${backendURL}/api/note/${UUID}/requestLink`, {
        title: pageTitle
      });
      const page = response.data.page;
      console.log(response.data);
      if (page) {
        // If the page exists, return a link to it
        return (
          <Link href={`/note/${page.page_uid}`}>
            {page.title}
          </Link>
        );
      } else {
        console.log("NO PAGE");
        // If the page doesn't exist, return just the title
        return <>{pageTitle}</>;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Function to parse input text and create links
  const createLink = (text: string): string => {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    let parsedText = text;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const pageTitle = match[1];
      const linkComponent = makeLink(pageTitle); // Get the promise
      // TODO: Replace match[0] with the linkComponent
    }

    return parsedText;
  };

    const createBlock = (event: any, blocks: any, index: number) => {
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
                .post(`${backendURL}/api/note/${UUID}/createBlock`, {
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

      const deleteBlock = async (event: any, blocks: any, index: number) => {
        try {
            
            // Delete block without server
            const post = event.target.textContent; // Extract text content instead of HTML content
            const response = await axios.post(`${backendURL}/api/note/${UUID}/deleteBlock`, {
                parent_uid: event.target.getAttribute('data-id'),
                post,
            });

            const uid = response.data.new_uid;
            const focusedElement = document.querySelector(`[data-id="${uid}"]`);
            if(focusedElement != null){
                const postNode = document.createTextNode(post);
                focusedElement.appendChild(postNode);
            

                const range = document.createRange();
                range.setStart(focusedElement.lastChild!, 0);
                range.collapse(true);

                const selection = window.getSelection();
                if (selection != null){
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                (focusedElement as HTMLElement)?.focus();

                event.target.remove();
            }
            //change index now

            //change blocks array
            blocks.splice(index, 1);
            //setBlocks(blocks)
            console.log(blocks)
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleBackspace = (
        event: any,
        blocks: any[],
        index: number,
    ) => {
        const cursorPosition = getCaretPosition(event.currentTarget);
        const textBeforeCursor = event.currentTarget.innerHTML.substring(0, cursorPosition);
        if (textBeforeCursor.length === 0) {
        deleteBlock(event, blocks, index);
        }
    };

    const saveData = (event:any) => {
        try {
            //save data without server
            axios
                .post(`${backendURL}/api/note/${UUID}/saveData`, {
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

    
    return (
        <div className="notieren-app flex">
            {page && (
                <Sidebar initialPages={pages} title={title}/>
            )}
            {page && (
                <div className="frame w-3/4 p-8 overflow-hidden">
                    <div
                        style={{
                            maxWidth: '100%',
                            minWidth: '0px',
                            margin: 'auto',
                        }}
                    >
                        <div
                            className="title text-block text-4xl mb-4 font-bold"
                            data-id={page.page_uid}
                            style={{
                                fontSize: '30px',
                                paddingLeft: 'calc(96px + env(safe-area-inset-left))',
                                paddingRight: 'calc(96px + env(safe-area-inset-right))',
                            }}
                            data-text="Untitled"
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
                                className="note rounded-md"
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