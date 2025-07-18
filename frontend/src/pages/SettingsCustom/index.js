import React, { useState, useEffect, useContext } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import CreditsManager from "../../components/CreditsManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import UploaderCert from "../../components/Settings/UploaderCert";
import ChipConversationUpload from "../../components/Settings/ChipConversationUpload";
import ReportLogs from "../../components/ReportLogs";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage/index.js";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
    // background: "#f2f5f3",
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
    borderRadius: 4,
  },
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [oldSettings, setOldSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { find, updateSchedules } = useCompanies();

  //novo hook
  const { getAll: getAllSettings } = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = user.companyId;
        const company = await find(companyId);

        const settingList = await getAllSettings(companyId);

        const settingListOld = await getAllSettingsOld();

        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);

        /*  if (Array.isArray(settingList)) {
           const scheduleType = settingList.find(
             (d) => d.key === "scheduleType"
           );
           if (scheduleType) {
             setSchedulesEnabled(scheduleType.value === "company");
           }
         } */
        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
    <MainContainer className={classes.root}>
      {user.profile === "user" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <Title>{i18n.t("settings.title")}</Title>
          </MainHeader>
          <Paper className={classes.mainPaper} elevation={1}>
            <Tabs
              value={tab}
              indicatorColor="primary"
              textColor="primary"
              scrollButtons="on"
              variant="scrollable"
              onChange={handleTabChange}
              className={classes.tab}
            >
              <Tab label={i18n.t("settings.tabs.options")} value={"options"} />
              {schedulesEnabled && <Tab label="Horários" value={"schedules"} />}
              {isSuper() ? <Tab label="Empresas" value={"companies"} /> : null}
              {isSuper() ? <Tab label="Créditos" value={"credits"} /> : null}
              {isSuper() ? <Tab label={i18n.t("settings.tabs.plans")} value={"plans"} /> : null}
              {isSuper() ? <Tab label={i18n.t("settings.tabs.helps")} value={"helps"} /> : null}
              {isSuper() ? <Tab label="Whitelabel" value={"whitelabel"} /> : null}
              {isSuper() ? <Tab label="Certificado Efí PIX" value={"uploadercert"} /> : null}
              {isSuper() ? <Tab label="Maturação de Chip" value={"chipmaturation"} /> : null}
              {isSuper() ? <Tab label="Envio de Relatórios" value={"reportlogs"} /> : null}
            </Tabs>
            <Paper className={classes.paper} elevation={0}>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"schedules"}
              >
                <SchedulesForm
                  loading={loading}
                  onSubmit={handleSubmitSchedules}
                  initialValues={schedules}
                />
              </TabPanel>
              <OnlyForSuperUser
                user={currentUser}
                yes={() => (
                  <>
                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"companies"}
                    >
                      <CompaniesManager />
                    </TabPanel>

                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"credits"}
                    >
                      <CreditsManager />
                    </TabPanel>

                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"plans"}
                    >
                      <PlansManager />
                    </TabPanel>

                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"helps"}
                    >
                      <HelpsManager />
                    </TabPanel>
                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"whitelabel"}
                    >
                      <Whitelabel
                        settings={oldSettings}
                      />
                    </TabPanel>
                    <TabPanel
                    className={classes.container}
                    value={tab}
                    name={"uploadercert"}
                    >
                    <UploaderCert />
                    </TabPanel>
                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"chipmaturation"}
                    >
                      <ChipConversationUpload />
                    </TabPanel>
                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"reportlogs"}
                    >
                      <ReportLogs />
                    </TabPanel>
                  </>
                )}
              />
              <TabPanel className={classes.container} value={tab} name={"options"}>
                <Options
                  settings={settings}
                  oldSettings={oldSettings}
                  user={currentUser}
                  scheduleTypeChanged={(value) =>
                    setSchedulesEnabled(value === "company")
                  }
                />
              </TabPanel>
            </Paper>
          </Paper>
        </>}
    </MainContainer>
  );
};

export default SettingsCustom;
