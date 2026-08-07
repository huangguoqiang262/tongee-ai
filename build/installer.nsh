!macro preInit
  ; 检测是否为更新安装（electron-updater 会设置 isUpdated 标记）
  ${If} ${isUpdated}
    ; 更新时静默安装，跳过所有安装页面
    SetSilent silent
  ${EndIf}
!macroend

!macro customInit
  ; 如果正在更新，读取之前的安装路径并复用
  ${If} ${isUpdated}
    ; 尝试从 HKLM 读取（perMachine 安装）
    ReadRegStr $0 HKLM "${UNINSTALL_REGISTRY_KEY}" InstallLocation
    ${If} $0 != ""
      StrCpy $INSTDIR $0
    ${Else}
      ; 尝试从 HKCU 读取（perUser 安装）
      ReadRegStr $0 HKCU "${UNINSTALL_REGISTRY_KEY}" InstallLocation
      ${If} $0 != ""
        StrCpy $INSTDIR $0
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend

!macro customUnInit
  ; 更新时静默卸载旧版本
  ${If} ${isUpdated}
    SetSilent silent
  ${EndIf}
!macroend
