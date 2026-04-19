import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { 
  Button, 
  Form, 
  Field, 
  NavBar, 
  RadioGroup, 
  Radio, 
  Toast,
  Tabbar,
  TabbarItem,
  Icon,
  Grid,
  GridItem,
  List,
  PullRefresh,
  Tag,
  Tabs,
  Tab,
  Uploader,
  Cell,
  Popup,
  Search
} from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

app.use(router)
app.use(Button)
app.use(Form)
app.use(Field)
app.use(NavBar)
app.use(RadioGroup)
app.use(Radio)
app.use(Toast)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Icon)
app.use(Grid)
app.use(GridItem)
app.use(List)
app.use(PullRefresh)
app.use(Tag)
app.use(Tabs)
app.use(Tab)
app.use(Uploader)
app.use(Cell)
app.use(Popup)
app.use(Search)

app.mount('#app')
