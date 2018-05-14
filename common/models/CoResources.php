<?php

namespace common\models;

use Yii;
use yii\db\ActiveQuery;
use yii\db\Connection;

/**
 * This is the model class for table "co_resources".
 *
 * @property integer $resource_id
 * @property integer $parent_id
 * @property string $resource_name
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoRolesResources[] $coRolePermissions
 */
class CoResources extends \yii\db\ActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_resources';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['parent_id', 'created_by', 'modified_by'], 'integer'],
                [['resource_name', 'resource_url', 'parent_id'], 'required'],
                [['created_at', 'modified_at'], 'safe'],
                [['resource_name'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'resource_id' => 'Resource ID',
            'parent_id' => 'Parent ID',
            'resource_name' => 'Resource Name',
            'resource_url' => 'Resource Url',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCoRolesResources() {
        return $this->hasMany(CoRolesResources::className(), ['resource_id' => 'resource_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getChild() {
        return $this->hasMany(self::className(), ['parent_id' => 'resource_id']);
    }

    public function afterSave($insert, $changedAttributes) {
        $organization = CoOrganization::find()->andWhere(['status' => '1'])->all();
        foreach ($organization as $org) {
            $conn_dsn = "mysql:host={$org->org_db_host};dbname={$org->org_database}";
            $conn_username = $org->org_db_username;
            $conn_password = $org->org_db_password;

            $connection = new Connection([
                'dsn' => $conn_dsn,
                'username' => $conn_username,
                'password' => $conn_password,
            ]);
            $connection->open();
            $sql = "INSERT INTO co_resources VALUES({$this->resource_id},'{$this->parent_id}','{$this->resource_name}','{$this->resource_url}','-1','{$this->created_at}','{$this->modified_by}','{$this->modified_at}')";
            $command = $connection->createCommand($sql);
            $command->execute();
            $connection->close();
        }
        return parent::afterSave($insert, $changedAttributes);
    }

}
