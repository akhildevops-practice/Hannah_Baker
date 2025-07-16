import Footer from "../../components/Footer";
import { makeStyles } from "@material-ui/core/styles";

import TopNavBar from "../../components/Navigation/TopNavBar";

import { Layout } from "antd";
import SideNavBar from "../../components/Navigation/SideNavBar";

const { Header, Content, Sider } = Layout;

type Props = {
  children?: any;
  handleLogout: any;
  activeModules: any;
};

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    overflow: "hidden !important",
  },
  appLayout : {
    "& .ant-layout": {
      background : "none !important"
    },
  }
}));

/**
 *
 * This Basic Layout HOC wraps in the components and provides them with a uniform structure as well as controls the whole application viewport,
 * i.e. restructures the application for Desktop and Mobile devices.
 */
function BasicLayout({ children, handleLogout, activeModules }: Props): any {
  const classes = useStyles();

  return (
    <Layout style={{background : "none"}} className={classes.appLayout}>
      <Sider
        width={53}
        style={{
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          left: 0,
          background: "#ffffff",
          zIndex: 2, // Set higher zIndex to ensure Sider stays above other components
        }}
      >
        <SideNavBar activeModules={activeModules} />
      </Sider>
      <Layout style={{ marginLeft: 61 }}>
        <Header
          className="header"
          style={{
            position: "fixed",
            width: `calc(100% - 61px)`,
            zIndex: 1,
            background: "white !important",
          }}
        >
          <TopNavBar handleLogout={handleLogout} />
        </Header>
        <Content
          className={classes.content}
          style={{ padding: "60px 0px 0px 0px", background: "#ffffff" }}
        >
          <div
            style={{
              height: "calc(100vh - 10vh)",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default BasicLayout;