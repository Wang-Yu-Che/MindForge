import React from 'react';
import { Carousel, Card, Typography, Divider, Grid } from '@arco-design/web-react';
import './ForumPage.css';

const { Title, Paragraph } = Typography;
const Row = Grid.Row;
const Col = Grid.Col;

export default function CCFForumPage() {
  return (
    <div className="ccf-container">
      <div className="ccf-carousel-section">
        <Carousel autoPlay showArrow="hover" indicatorType="line">
          <img src="/2f47b5a6-8917-4ee3-b486-2a6b5858b9d7.png" alt="slide1" className="carousel-img" />
          <img src="/a9a30680-ae5a-46f7-af31-36d6912b705c.png" alt="slide2" className="carousel-img" />
        </Carousel>
        <div className="ccf-signup-box">
          <Title heading={5}>公告栏</Title>
          </div>
      </div>

      <Divider />

      <div className="ccf-news-section">
        <Title heading={5}>📰 帖子墙</Title>
        <Row gutter={20}>
          <Col span={12}>
            <Card hoverable>
              <img src="/news-img-1.png" alt="news1" className="news-img" />
              <Title heading={6}>腾讯科学家论坛迎来首届人工智能论坛</Title>
              <Paragraph>
                12月6日，由中国计算机学会（CCF）、中国移动主办，CCF大模型论坛承办...
              </Paragraph>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable>
              <img src="/news-img-2.png" alt="news2" className="news-img" />
              <Title heading={6}>大模型产业论坛圆满举办！</Title>
              <Paragraph>
                12月5日下午，在合肥施柏阁大观酒店成功举办，由CCF、安徽科技厅主办...
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
