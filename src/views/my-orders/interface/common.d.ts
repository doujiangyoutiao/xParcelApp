/**
 * 弹窗类型
 */
export interface Dialog {
  title: string;
  visible: boolean;
}

/**
 * 通用组件选择项类型(下拉框)
 */
export interface Option {
  value: string;
  key: string;
  checked?: boolean;
  children?: Option[];
}

/**
 * 通用组件选择项类型(下拉框)
 */
export interface SelectOption {
  id: number;
  text: string;
  key: any;
  value: any;
}

// 分页配置参数

export interface PageConfig {
  pageSize: number;
  pageTotal: number;
  pageNumber: number;
}

export interface MemuOptions {
  /**
   * 菜单ID
   */
  id?: number;
  /**
   * 父菜单ID
   */
  parentId: string;
  /**
   * 菜单名称
   */
  name: string;
  /**
   * 菜单是否可见(1:是;0:否;)
   */
  visible: number;
  icon?: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 组件路径
   */
  component?: string;
  /**
   * 路由路径
   */
  path: string;
  /**
   * 跳转路由路径
   */
  redirect?: string;

  /**
   * 菜单类型
   */
  type: string;
  children?: MemuOptions[];
}
