# 贡献指南

感谢你关注蓝鲸 GEO。欢迎通过 Issue、功能建议和 Pull Request 参与项目建设。

## 开发环境

建议使用 Node.js 20.19+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

提交前请运行：

```bash
pnpm build
git diff --check
```

## 提交流程

1. Fork 仓库并基于最新 `main` 创建功能分支。
2. 保持改动范围清晰，尽量避免在同一个提交中混合无关调整。
3. 遵循现有 Vue 3、TypeScript、Element Plus 与 SCSS 代码风格。
4. 提交前完成构建和必要的页面回归。
5. 创建 Pull Request，简要说明改动目的、验证方式及界面变化。

推荐使用简洁的 Conventional Commits 风格，例如：

```text
feat: 增加功能
fix: 修复页面问题
docs: 更新文档
```

## 公开仓库数据安全

请勿提交任何正式环境或个人敏感数据，包括但不限于：

- Authorization、Cookie、Token 和其他访问凭证；
- 租户标识、用户标识、手机号和真实联系方式；
- 私有对象存储 Key、签名 URL、正式订单或账户授权信息；
- HAR、网络抓包、未脱敏接口响应和正式用户业务数据。

`.gitignore` 中的 `data/` 与 `scripts/capture_mock*.py` 是公开仓库的安全边界，请勿取消。新增演示数据必须使用虚构数据或经过确认的脱敏快照。

## 安全问题

安全漏洞或疑似数据泄露请不要创建公开 Issue，请按照 [安全政策](SECURITY.md) 私下报告。

## 许可证

提交代码即表示你有权提供该贡献，并同意贡献内容按照本仓库的 [AGPL-3.0-only](LICENSE) 许可证发布。如果某项贡献还需要纳入独立商业版本，维护者会另行与贡献者确认相应授权；未经单独同意，不会自动将第三方贡献改用专有许可证。
