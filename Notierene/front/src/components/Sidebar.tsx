import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../../config';

type Page = {
    page_uid: string,
    title: string,
}

type SidebarProps = {
  initialPages: Page[],
  title: string,
}

const Sidebar = ({ initialPages, title }: SidebarProps) => {
    const [pages, setPages] = useState<{ page_uid: string; title: string; }[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
      setShowPopup(!showPopup);
      console.log("UIU")
    }
    useEffect(() => {
        // Update pages state once initialPages is available
        if (initialPages.length > 0) {
            setPages(initialPages);
        }
    }, [initialPages]);

    const createPage = async () => {
        try {
            // Create page without server
            const response = await axios.post(`${backendURL}/createPage`, {});
            const page_uid = response.data.page_uid;
            const title = "Untitled";
            const newPage = { page_uid: page_uid, title: title };
            setPages(prevPages => [...prevPages, newPage]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deletePage = async (page_uid: string) => {
        try {
            console.log("Page DELETE:", page_uid);
            const response = await axios.post(`${backendURL}/deletePage`, {
                page_uid: page_uid
            });
            setPages(prevPages => prevPages.filter(page => page.page_uid !== page_uid));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="sidebar">
          <div onClick={togglePopup} className='text-white'>
            {title}
          </div>
          <div onClick={createPage} className="cursor-pointer text-white">Add Page</div>
          {pages.map((page, index) => (
            <div key={index} data-id={page.page_uid} className=" flex" >
              <Link href={`/note/${page.page_uid}`} className='sidebar-link'>
                <div className="truncate text-white hover:underline">
                  {page.title !== '' ? page.title : "Untitled"}
                </div>
              </Link>
              <div onClick={() => deletePage(page.page_uid)} className="page-delete text-red-500 float-right">
                X
              </div>
            </div>
          ))}
        </div>
      );
};

export default Sidebar;
