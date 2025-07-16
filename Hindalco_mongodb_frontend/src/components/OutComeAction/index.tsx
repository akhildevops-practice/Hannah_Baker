import React,{useState} from 'react'
import { Table, Button, Upload, message } from 'antd';
import { UploadOutlined,DeleteOutlined } from '@ant-design/icons';
import "./style.css";
import CommonReferencesTab from 'components/CommonReferencesComponents/CommonReferencesTab';


function OutComeAction() {
    
    const [drawer, setDrawer] = useState<any>({
        mode: "create",
        open: false,
        clearFields: true,
        toggle: false,
        data: {},
      });
 
  return (
    <div>
        <CommonReferencesTab drawer={drawer}/>

    </div>
  )
}

export default OutComeAction