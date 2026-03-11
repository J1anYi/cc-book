import asyncio
from browser_use import Agent
from browser_use.llm.openai.chat import ChatOpenAI

async def main():
    llm = ChatOpenAI(
        model="qianfan-code-latest",
        base_url="https://qianfan.baidubce.com/v2/coding",
        api_key="bce-v3/ALTAKSP-GuMl74YX86MxPGl2OcGtH/e992ed946fb302ec2d0b52b5095dc2168286ded8",
    )

    agent = Agent(
        task="""访问 http://localhost:3000 图书管理系统

        1. 使用管理员账户登录：
           - 用户名：admin
           - 密码：admin123

        2. 点击左侧菜单"系统管理" -> "图书管理"

        3. 添加以下5本书籍（点击"添加图书"按钮，填写表单后提交）：

           书1：Python编程从入门到实践, ISBN:9787115428028, 作者:Eric Matthes, 出版社:人民邮电出版社, 分类:编程, 位置:A区-1层-3架, 数量:5
           书2：深入理解计算机系统, ISBN:9787111544937, 作者:Randal E.Bryant, 出版社:机械工业出版社, 分类:计算机, 位置:A区-2层-1架, 数量:3
           书3：三体, ISBN:9787536692930, 作者:刘慈欣, 出版社:重庆出版社, 分类:科幻, 位置:B区-1层-2架, 数量:10
           书4：活着, ISBN:9787506365437, 作者:余华, 出版社:作家出版社, 分类:文学, 位置:B区-2层-1架, 数量:8
           书5：算法导论, ISBN:9787111407010, 作者:Thomas H.Cormen, 出版社:机械工业出版社, 分类:算法, 位置:A区-1层-5架, 数量:4

        4. 添加完书籍后，为每本书上传封面图片：
           - 点击每本书对应的"封面"按钮
           - 在出现的文件选择框中选择一个图片文件（如果找不到文件，跳过这步）

        完成后报告结果。
        """,
        llm=llm,
        use_vision=False,
        max_actions_per_step=10,
    )

    result = await agent.run()
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
